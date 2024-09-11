import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy.orm import joinedload

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# CORS configuration
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "supports_credentials": True}})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Ensure SECRET_KEY is set
if not app.config['SECRET_KEY']:
    raise ValueError("No SECRET_KEY set for Flask application")

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    role = db.Column(db.String(20), nullable=False)  # 'waiter' or 'manager'
    name = db.Column(db.String(100), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Shift(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('shifts', lazy=True))
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='requested')
    shift_type = db.Column(db.String(20), nullable=False)  # 'morning', 'evening', or 'double'

# Login manager
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'message': 'Logged in successfully', 'role': user.role, 'name': user.name})
    return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/users', methods=['GET', 'POST'])
@login_required
def handle_users():
    if current_user.role != 'manager':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'POST':
        data = request.json
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        new_user = User(email=data['email'], role=data['role'], name=data['name'])
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201
    else:
        users = User.query.all()
        return jsonify([{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role} for u in users])

@app.route('/users/<int:user_id>', methods=['PUT', 'DELETE'])
@login_required
def manage_user(user_id):
    if current_user.role != 'manager':
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    
    if request.method == 'PUT':
        data = request.json
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        if 'password' in data:
            user.set_password(data['password'])
        db.session.commit()
        return jsonify({'message': 'User updated successfully'})
    
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'})

@app.route('/shifts', methods=['GET', 'POST'])
@login_required
def handle_shifts():
    if request.method == 'POST':
        data = request.json
        user_id = data.get('user_id', current_user.id)
        
        # Check if the current user is a manager or if they're creating a shift for themselves
        if current_user.role != 'manager' and user_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403

        new_shift = Shift(
            user_id=user_id,
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
            shift_type=data['shift_type'],
            status='approved' if current_user.role == 'manager' else 'requested'
        )
        db.session.add(new_shift)
        db.session.commit()
        return jsonify({'message': 'Shift created successfully', 'id': new_shift.id}), 201
    else:
        if current_user.role == 'manager':
            shifts = Shift.query.options(joinedload(Shift.user)).all()
        else:
            shifts = Shift.query.filter_by(user_id=current_user.id).all()
        
        return jsonify([{
            'id': shift.id,
            'user_id': shift.user_id,
            'user_name': shift.user.name,  # Assuming User model has a 'name' field
            'date': shift.date.isoformat(),
            'start_time': shift.start_time.isoformat(),
            'end_time': shift.end_time.isoformat(),
            'status': shift.status,
            'shift_type': shift.shift_type
        } for shift in shifts])

@app.route('/shifts/<int:shift_id>', methods=['PUT'])
@login_required
def update_shift(shift_id):
    if current_user.role != 'manager':
        return jsonify({'message': 'Unauthorized'}), 403
   
    shift = Shift.query.get_or_404(shift_id)
    data = request.json
    
    # Update all provided fields
    for field in ['status', 'date', 'start_time', 'end_time', 'shift_type', 'user_id']:
        if field in data:
            if field == 'date':
                setattr(shift, field, datetime.strptime(data[field], '%Y-%m-%d').date())
            elif field in ['start_time', 'end_time']:
                setattr(shift, field, datetime.strptime(data[field], '%H:%M').time())
            else:
                setattr(shift, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Shift updated successfully'})

# Additional CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Database initialization and admin user creation
def init_db():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email=os.getenv('ADMIN_EMAIL')).first():
            admin_user = User(
                email=os.getenv('ADMIN_EMAIL'),
                role='manager',
                name='Admin'
            )
            admin_user.set_password(os.getenv('ADMIN_PASSWORD'))
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created successfully.")

# Call init_db function
init_db()

# Main
if __name__ == '__main__':
    app.run(debug=True)