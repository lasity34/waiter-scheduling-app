import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import styled from 'styled-components';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

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

const CalendarContainer = styled.div`
  height: 500px;
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

const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const LogoutButton = styled(Button)`
  background-color: #dc3545;

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
  userName: string;
  shiftType: 'morning' | 'evening' | 'double';
}

const WaiterDashboard: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftModal, setShiftModal] = useState({ isOpen: false, date: null as Date | null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
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
        userName: shift.user_name,
        shiftType: shift.shift_type
      }));
      setShifts(formattedShifts);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const handleSlotSelect = (slotInfo: SlotInfo) => {
    setShiftModal({ isOpen: true, date: slotInfo.start });
  };

  const handleAddShift = async (shiftType: 'morning' | 'evening' | 'double') => {
    if (!shiftModal.date) return;

    const shiftDate = moment(shiftModal.date);
    let startTime, endTime;

    switch (shiftType) {
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
        date: shiftDate.format('YYYY-MM-DD'),
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftType
      });

      alert('Shift added successfully');
      fetchShifts();
      setShiftModal({ isOpen: false, date: null });
    } catch (error) {
      console.error('Error adding shift:', error);
      alert('Failed to add shift');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/logout');
      localStorage.removeItem('user');
      navigate('/', { state: { message: 'You have been successfully logged out.' } });
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out');
    }
  };

  const eventStyleGetter = (event: Shift) => {
    const isCurrentUser = event.userId === parseInt(localStorage.getItem('userId') || '0');
    const backgroundColor = isCurrentUser ? '#4CAF50' : '#2196F3';
    return { style: { backgroundColor } };
  };

  return (
    <DashboardContainer>
      <Header>Waiter Dashboard</Header>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      <CalendarContainer>
        <Calendar
          localizer={localizer}
          events={shifts}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSlotSelect}
          selectable
          eventPropGetter={eventStyleGetter}
        />
      </CalendarContainer>
      {shiftModal.isOpen && (
        <ShiftModal>
          <h3>Add Shift</h3>
          <Button onClick={() => handleAddShift('morning')}>Morning Shift</Button>
          <Button onClick={() => handleAddShift('evening')}>Evening Shift</Button>
          <Button onClick={() => handleAddShift('double')}>Double Shift</Button>
          <Button onClick={() => setShiftModal({ isOpen: false, date: null })}>Cancel</Button>
        </ShiftModal>
      )}
    </DashboardContainer>
  );
};

export default WaiterDashboard;