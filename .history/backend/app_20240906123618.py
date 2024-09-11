import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)

# Use environment variables for configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Waiter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

class Shift(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    waiter_id = db.Column(db.Integer, db.ForeignKey('waiter.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='requested')  # 'requested', 'approved', 'rejected'

@app.route('/waiters', methods=['GET', 'POST'])
def handle_waiters():
    if request.method == 'POST':
        data = request.json
        new_waiter = Waiter(name=data['name'], email=data['email'])
        db.session.add(new_waiter)
        db.session.commit()
        return jsonify({'message': 'Waiter added successfully', 'id': new_waiter.id}), 201
    else:
        waiters = Waiter.query.all()
        return jsonify([{'id': w.id, 'name': w.name, 'email': w.email} for w in waiters])

@app.route('/shifts', methods=['GET', 'POST'])
def handle_shifts():
    if request.method == 'POST':
        data = request.json
        new_shift = Shift(
            waiter_id=data['waiter_id'],
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time']
        )
        db.session.add(new_shift)
        db.session.commit()
        return jsonify({'message': 'Shift requested successfully', 'id': new_shift.id}), 201
    else:
        shifts = Shift.query.all()
        return jsonify([{
            'id': shift.id,
            'waiter_id': shift.waiter_id,
            'date': shift.date.isoformat(),
            'start_time': shift.start_time.isoformat(),
            'end_time': shift.end_time.isoformat(),
            'status': shift.status
        } for shift in shifts])

@app.route('/shifts/<int:shift_id>', methods=['PUT'])
def update_shift(shift_id):
    shift = Shift.query.get_or_404(shift_id)
    data = request.json
    shift.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Shift updated successfully'})

if __name__ == '__main__':
    app.run(debug=True)