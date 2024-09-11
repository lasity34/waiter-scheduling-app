import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import styled from 'styled-components';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
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

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background-color: #2ec07b;
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
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const ConfirmationText = styled.span`
  font-size: 0.9em;
  margin-bottom: 10px;
  text-align: center;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmButton = styled(ActionButton)`
  background-color: #28a745;
  color: white;
  font-size: 0.8em;
  padding: 5px 10px;

  &:hover {
    background-color: #218838;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #6c757d;
  color: white;
  font-size: 0.8em;
  padding: 5px 10px;

  &:hover {
    background-color: #5a6268;
  }
`;

const UserItemWrapper = styled.div`
  position: relative;
`;

const ShiftModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const ModalSelect = styled(Select)`
  margin-bottom: 10px;
`;

const ModalButton = styled(Button)`
  margin-right: 10px;
`;

const EditShiftModal = styled(ShiftModal)`
  // You can add specific styles for the edit modal if needed
`;

const LogoutButton = styled(Button)`
  background-color: #dc3545;
  color: white;

  &:hover {
    background-color: #c82333;
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

interface ShiftModalState {
  isOpen: boolean;
  date: Date | null;
  selectedWaiter: number | null;
  shiftType: 'morning' | 'evening' | 'double' | null;
}

interface EditShiftModalState {
  isOpen: boolean;
  shift: Shift | null;
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
  const [shiftModal, setShiftModal] = useState<ShiftModalState>({
    isOpen: false,
    date: null,
    selectedWaiter: null,
    shiftType: null,
  });
  const [editShiftModal, setEditShiftModal] = useState<EditShiftModalState>({
    isOpen: false,
    shift: null,
  });
  const [waiters, setWaiters] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
    fetchUsers();
    fetchWaiters();
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

  const fetchWaiters = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setWaiters(response.data.filter((user: User) => user.role === 'waiter'));
    } catch (error) {
      console.error('Error fetching waiters:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/users', newUser);
      alert('User created successfully');
      setNewUser({ name: '', email: '', password: '', role: 'waiter' });
      fetchUsers();
      fetchWaiters();
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
      fetchWaiters();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action');
    }

    closeConfirmation();
  };

  const handleSlotSelect = (slotInfo: SlotInfo) => {
    setShiftModal({
      isOpen: true,
      date: slotInfo.start,
      selectedWaiter: null,
      shiftType: null,
    });
  };

  const handleAddShift = async () => {
    if (!shiftModal.selectedWaiter || !shiftModal.shiftType || !shiftModal.date) {
      alert('Please select a waiter and shift type');
      return;
    }

    const shiftDate = moment(shiftModal.date);
    let startTime, endTime;

    switch (shiftModal.shiftType) {
      case 'morning':
        startTime = '09:00';
        endTime = '17:00';
        break;
      case 'evening':
        startTime = '17:00';
        endTime = '01:00';
        break;
      case 'double':
        startTime = '09:00';
        endTime = '01:00';
        break;
    }

    try {
      await axios.post('http://localhost:5000/shifts', {
        user_id: shiftModal.selectedWaiter,
        date: shiftDate.format('YYYY-MM-DD'),
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftModal.shiftType
      });

      alert('Shift added successfully');
      fetchShifts();
      setShiftModal({ isOpen: false, date: null, selectedWaiter: null, shiftType: null });
    } catch (error) {
      console.error('Error adding shift:', error);
      alert('Failed to add shift');
    }
  };

  const handleShiftUpdate = (shift: Shift) => {
    setEditShiftModal({ isOpen: true, shift });
  };

  const handleEditShift = async (newShiftType: 'morning' | 'evening' | 'double') => {
    if (!editShiftModal.shift) return;

    let startTime, endTime;
    switch (newShiftType) {
      case 'morning':
        startTime = '09:00';
        endTime = '17:00';
        break;
      case 'evening':
        startTime = '17:00';
        endTime = '01:00';
        break;
      case 'double':
        startTime = '09:00';
        endTime = '01:00';
        break;
    }

    try {
      await axios.put(`http://localhost:5000/shifts/${editShiftModal.shift.id}`, {
        shift_type: newShiftType,
        start_time: startTime,
        end_time: endTime
      });
      fetchShifts();
      setEditShiftModal({ isOpen: false, shift: null });
    } catch (error) {
      console.error('Error updating shift:', error);
      alert('Failed to update shift');
    }
  };

  const eventStyleGetter = (event: Shift) => {
    let backgroundColor;
    switch (event.shiftType) {
      case 'morning':
        backgroundColor = '#4e79a7';
        break;
      case 'evening':
        backgroundColor = '#f28e2c';
        break;
      case 'double':
        backgroundColor = '#e15759';
        break;
      default:
        backgroundColor = '#76b7b2';
    }
    return { style: { backgroundColor } };
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/logout');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out');
    }
  };

  const handleRemoveShift = async () => {
    if (!editShiftModal.shift) return;

    try {
      await axios.delete(`http://localhost:5000/shifts/${editShiftModal.shift.id}`);
      fetchShifts();
      setEditShiftModal({ isOpen: false, shift: null });
      alert('Shift removed successfully');
    } catch (error) {
      console.error('Error removing shift:', error);
      alert('Failed to remove shift');
    }
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
              <UserItemWrapper key={user.id}>
                <UserItem>
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
                </UserItem>
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
              </UserItemWrapper>
            ))}
          </UserGroup>
        ))}
      </UserList>
    );
  };

  return (
    <DashboardContainer>
  <HeaderContainer>
        <Header>Manager Dashboard</Header>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </HeaderContainer>
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
            onSelectEvent={(event: Shift) => handleShiftUpdate(event)}
            onSelectSlot={handleSlotSelect}
            selectable
          />
        </CalendarContainer>
      </ContentContainer>
      {shiftModal.isOpen && (
        <ShiftModal>
          <h3>Add Shift</h3>
          <ModalSelect
            value={shiftModal.selectedWaiter || ''}
            onChange={(e) => setShiftModal({...shiftModal, selectedWaiter: Number(e.target.value)})}
          >
            <option value="">Select Waiter</option>
            {waiters.map(waiter => (
              <option key={waiter.id} value={waiter.id}>{waiter.name}</option>
            ))}
          </ModalSelect>
          <ModalSelect
            value={shiftModal.shiftType || ''}
            onChange={(e) => setShiftModal({...shiftModal, shiftType: e.target.value as 'morning' | 'evening' | 'double'})}
          >
            <option value="">Select Shift Type</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="double">Double</option>
          </ModalSelect>
          <ModalButton onClick={handleAddShift}>Add Shift</ModalButton>
          <ModalButton onClick={() => setShiftModal({isOpen: false, date: null, selectedWaiter: null, shiftType: null})}>Cancel</ModalButton>
        </ShiftModal>
      )}
      {editShiftModal.isOpen && editShiftModal.shift && (
        <EditShiftModal>
          <h3>Edit Shift</h3>
          <p>Current shift: {editShiftModal.shift.title}</p>
          <ModalSelect
            value={editShiftModal.shift.shiftType}
            onChange={(e) => handleEditShift(e.target.value as 'morning' | 'evening' | 'double')}
          >
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="double">Double</option>
          </ModalSelect>
          <ModalButton onClick={handleRemoveShift}>Remove Shift</ModalButton>
          <ModalButton onClick={() => setEditShiftModal({ isOpen: false, shift: null })}>Cancel</ModalButton>
        </EditShiftModal>
      )}
    </DashboardContainer>
  );
};

export default ManagerDashboard;