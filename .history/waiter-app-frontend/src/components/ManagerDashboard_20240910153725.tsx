import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import styled from 'styled-components';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const WaiterList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const WaiterItem = styled.li`
  margin-bottom: 5px;
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

const ManagerDashboard: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'waiter' });

  useEffect(() => {
    fetchShifts();
    fetchUsers();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/shifts', { withCredentials: true });
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
      const response = await axios.get('http://localhost:5000/users', { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/users', newUser, { withCredentials: true });
      alert('User created successfully');
      setNewUser({ name: '', email: '', password: '', role: 'waiter' });
      fetchUsers();  // Refresh the user list
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleShiftUpdate = async (shiftId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/shifts/${shiftId}`, { status: newStatus }, { withCredentials: true });
      fetchShifts();  // Refresh shifts after update
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
      const response = await axios.post('http://localhost:5000/shifts', {
        user_id: parseInt(userId),
        date: moment(slotInfo.start).format('YYYY-MM-DD'),
        start_time: moment(slotInfo.start).format('HH:mm'),
        end_time: moment(slotInfo.end).format('HH:mm'),
        shift_type: shiftType
      }, { withCredentials: true });

      alert('Shift added successfully');
      fetchShifts();  // Refresh shifts after adding
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

          <h3>Waiters</h3>
          <WaiterList>
            {users.filter(user => user.role === 'waiter').map(waiter => (
              <WaiterItem key={waiter.id}>{waiter.name} (ID: {waiter.id})</WaiterItem>
            ))}
          </WaiterList>
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