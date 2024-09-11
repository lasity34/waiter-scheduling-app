import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import styled from 'styled-components';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set default axios configuration
axios.defaults.withCredentials = true;

const localizer = momentLocalizer(moment);

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const Header = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const SidePanel = styled.div`
  width: 300px;
`;

const CalendarContainer = styled.div`
  flex-grow: 1;
  height: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const UserList = styled.div`
  margin-top: 20px;
`;

const UserGroup = styled.div`
  margin-bottom: 15px;
`;

const UserGroupTitle = styled.h4`
  margin-bottom: 10px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const UserActions = styled.div`
  display: flex;
  gap: 5px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const ToggleButton = styled(ActionButton)`
  background-color:  #2ec07b ;
  color: white;
  font-size: 0.7rem;

  &:hover {
    background-color: #138496;
  }
`;

const RemoveButton = styled(ActionButton)`
  background-color: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 0em 0.2em;

  &:hover {
    background-color: #c82333;
  }
`;

const ConfirmationPopup = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConfirmationText = styled.span`
  font-size: 0.9em;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const ConfirmButton = styled(ActionButton)`
  background-color: #28a745;
  color: white;

  &:hover {
    background-color: #218838;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #6c757d;
  color: white;

  &:hover {
    background-color: #5a6268;
  }
`;




interface Shift {
  id: number;
  title: string;
  start: Date;
  end: Date;
  userId: number;
  status: string;
  shiftType: 'morning' | 'evening' | 'double';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ConfirmationState {
  isOpen: boolean;
  userId: number | null;
  action: 'remove' | 'toggle' | null;
  newRole?: string;
}

const ManagerDashboard: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'waiter' });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    userId: null,
    action: null,
  });

  useEffect(() => {
    fetchShifts();
    fetchUsers();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/shifts');
      const formattedShifts = response.data.map((shift: any) => ({
        id: shift.id,
        title: `${shift.user_name} - ${shift.shift_type}`,
        start: new Date(`${shift.date}T${shift.start_time}`),
        end: new Date(`${shift.date}T${shift.end_time}`),
        userId: shift.user_id,
        status: shift.status,
        shiftType: shift.shift_type
      }));
      setShifts(formattedShifts);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/users', newUser);
      alert('User created successfully');
      setNewUser({ name: '', email: '', password: '', role: 'waiter' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const openConfirmation = (userId: number, action: 'remove' | 'toggle', newRole?: string) => {
    setConfirmation({ isOpen: true, userId, action, newRole });
  };

  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, userId: null, action: null });
  };

  const handleConfirm = async () => {
    if (!confirmation.userId || !confirmation.action) return;

    try {
      if (confirmation.action === 'remove') {
        await axios.delete(`http://localhost:5000/users/${confirmation.userId}`);
        alert('User has been removed successfully');
      } else if (confirmation.action === 'toggle' && confirmation.newRole) {
        await axios.put(`http://localhost:5000/users/${confirmation.userId}`, { role: confirmation.newRole });
        alert(`User's role has been updated to ${confirmation.newRole}`);
      }
      fetchUsers();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action');
    }

    closeConfirmation();
  };

  const handleShiftUpdate = async (shiftId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/shifts/${shiftId}`, { status: newStatus });
      fetchShifts();
    } catch (error) {
      console.error('Error updating shift:', error);
    }
  };

  const handleAddShift = async (slotInfo: SlotInfo) => {
    const userId = prompt('Enter user ID for this shift:');
    if (!userId) return;

    const shiftType = prompt('Enter shift type (morning, evening, or double):');
    if (!['morning', 'evening', 'double'].includes(shiftType || '')) {
      alert('Invalid shift type');
      return;
    }

    try {
      await axios.post('http://localhost:5000/shifts', {
        user_id: parseInt(userId),
        date: moment(slotInfo.start).format('YYYY-MM-DD'),
        start_time: moment(slotInfo.start).format('HH:mm'),
        end_time: moment(slotInfo.end).format('HH:mm'),
        shift_type: shiftType
      });

      alert('Shift added successfully');
      fetchShifts();
    } catch (error) {
      console.error('Error adding shift:', error);
      alert('Failed to add shift');
    }
  };

  const eventStyleGetter = (event: Shift) => {
    let backgroundColor = '#3174ad';
    if (event.status === 'approved') {
      backgroundColor = '#28a745';
    } else if (event.status === 'rejected') {
      backgroundColor = '#dc3545';
    }
    return { style: { backgroundColor } };
  };

  const renderUserList = () => {
    const groupedUsers = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, User[]>);

    return (
      <UserList>
        {Object.entries(groupedUsers).map(([role, users]) => (
          <UserGroup key={role}>
            <UserGroupTitle>{role.charAt(0).toUpperCase() + role.slice(1)}s</UserGroupTitle>
            {users.map(user => (
              <UserItem key={user.id}>
                <span>{user.name} ({user.email})</span>
                <UserActions>
                  <ToggleButton 
                    onClick={() => openConfirmation(user.id, 'toggle', user.role === 'waiter' ? 'manager' : 'waiter')}
                  >
                    {user.role === 'waiter' ? 'Make Admin' : 'Make Waiter'}
                  </ToggleButton>
                  <RemoveButton onClick={() => openConfirmation(user.id, 'remove')}>
                    Remove
                  </RemoveButton>
                </UserActions>
                {confirmation.isOpen && confirmation.userId === user.id && (
                  <ConfirmationPopup>
                    <ConfirmationText>
                      {confirmation.action === 'remove' 
                        ? `Are you sure you want to remove ${user.name}?`
                        : `Are you sure you want to change ${user.name}'s role to ${confirmation.newRole}?`
                      }
                    </ConfirmationText>
                    <ConfirmationButtons>
                      <ConfirmButton onClick={handleConfirm}>Confirm</ConfirmButton>
                      <CancelButton onClick={closeConfirmation}>Cancel</CancelButton>
                    </ConfirmationButtons>
                  </ConfirmationPopup>
                )}
              </UserItem>
            ))}
          </UserGroup>
        ))}
      </UserList>
    );
  };

  return (
    <DashboardContainer>
      <Header>Manager Dashboard</Header>
      <ContentContainer>
        <SidePanel>
          <h3>Create New User</h3>
          <Form onSubmit={handleCreateUser}>
            <Input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="waiter">Waiter</option>
              <option value="manager">Manager</option>
            </Select>
            <Button type="submit">Create User</Button>
          </Form>

          <h3>User List</h3>
          {renderUserList()}
        </SidePanel>
        <CalendarContainer>
          <Calendar
            localizer={localizer}
            events={shifts}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event: Shift) => {
              const newStatus = prompt('Enter new status (approved/rejected/requested):');
              if (newStatus && ['approved', 'rejected', 'requested'].includes(newStatus)) {
                handleShiftUpdate(event.id, newStatus);
              }
            }}
            onSelectSlot={handleAddShift}
            selectable
          />
        </CalendarContainer>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default ManagerDashboard;