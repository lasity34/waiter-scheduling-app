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
    password_hash = db.Column(db.String(255))  # Increased length to 255
    role = db.Column(db.String(20), nullable=False)  # 'waiter' or 'manager'
    name = db.Column(db.String(100), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Shift(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='requested')  # 'requested', 'approved', 'rejected'

# Admin user creation
def create_admin_user():
    admin_email = os.getenv('ADMIN_EMAIL')
    admin_password = os.getenv('ADMIN_PASSWORD')
    if not User.query.filter_by(email=admin_email).first():
        admin_user = User(email=admin_email, role='manager', name='Admin')
        admin_user.set_password(admin_password)
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully.")

# Database initialization and admin user creation
def init_db():
    with app.app_context():
        db.drop_all()  # Be careful with this in production!
        db.create_all()
        create_admin_user()

# Call init_db function
init_db()

# Login manager
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Authentication routes
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

# User management routes (accessible only to managers)
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

# Shift routes
@app.route('/shifts', methods=['GET', 'POST'])
@login_required
def handle_shifts():
    if request.method == 'POST':
        data = request.json
        new_shift = Shift(
            user_id=current_user.id,
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time']
        )
        db.session.add(new_shift)
        db.session.commit()
        return jsonify({'message': 'Shift requested successfully', 'id': new_shift.id}), 201
    else:
        if current_user.role == 'manager':
            shifts = Shift.query.all()
        else:
            shifts = Shift.query.filter_by(user_id=current_user.id).all()
        return jsonify([{
            'id': shift.id,
            'user_id': shift.user_id,
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