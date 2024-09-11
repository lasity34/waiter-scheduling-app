import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False)  # 'waiter' or 'manager'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

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

# Login manager
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Authentication routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    new_user = User(email=data['email'], role=data['role'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'message': 'Logged in successfully', 'role': user.role})
    return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

# Waiter routes
@app.route('/waiters', methods=['GET', 'POST'])
@login_required
def handle_waiters():
    if current_user.role != 'manager':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'POST':
        data = request.json
        new_waiter = Waiter(name=data['name'], email=data['email'])
        db.session.add(new_waiter)
        db.session.commit()
        return jsonify({'message': 'Waiter added successfully', 'id': new_waiter.id}), 201
    else:
        waiters = Waiter.query.all()
        return jsonify([{'id': w.id, 'name': w.name, 'email': w.email} for w in waiters])

# Shift routes
@app.route('/shifts', methods=['GET', 'POST'])
@login_required
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
@login_required
def update_shift(shift_id):
    if current_user.role != 'manager':
        return jsonify({'message': 'Unauthorized'}), 403
    
    shift = Shift.query.get_or_404(shift_id)
    data = request.json
    shift.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Shift updated successfully'})

# Main
if __name__ == '__main__':
    app.run(debug=True)