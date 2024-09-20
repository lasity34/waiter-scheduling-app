import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchShifts, createShift, logout } from '../api';


const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: 100%;
  overflow-x: hidden;
`;

const Header = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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

const LogoutButton = styled(Button)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const NavButton = styled.button`
  background-color: white;
  border: 1px solid #322f2e;
  color: #322f2e;
  padding: 5px 10px;
  font-size: 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover,
  &:focus {
    background-color: #5c5c5c;
    color: white;
  }
`;

// calender

const CurrentMonthDisplay = styled.span`
  font-size: 1rem;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
`;

const CalendarContainer = styled.div`
  flex-grow: 1;
  height: 600px;
  overflow-x: auto;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
`;

const CalendarBody = styled.div`
  display: flex;
  flex-direction: column;
`;

// week

const WeekViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
  border: 1px solid #ddd;
  font-size: 14px;

  @media (max-width: 325px) {
    font-size: 12px;
  }
`;

const WeekHeader = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const WeekDayHeader = styled.div`
  flex: 1;
  text-align: center;
  padding: 5px 2px;
  min-width: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-right: 1px solid #ddd;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: #e6e6e6;
  }

  @media (max-width: 350px) {
    padding: 3px 1px;
    max-width: 25px;
    font-size: 0.3rem;
  }
`;

const WeekDayName = styled.div`
  font-weight: bold;
  font-size: 0.8rem;

  @media (max-width: 350px) {
    font-size: 0.7rem;
  }
`;

const WeekDayDate = styled.div`
  font-size: 0.7rem;
`;

const WeekBody = styled.div`
  position: relative;
  min-height: 300px;
  display: flex;

  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

const WeekShiftItem = styled.div<{ color: string; index: number; isCurrentUser: boolean }>`
  background-color: ${(props) => props.color};
  color: white;
  padding: 2px;
  margin: 1px;
  border-radius: 3px;
  font-size: 0.7rem;
  overflow: hidden;
  cursor: pointer;
  height: 40px;
  border: ${props => props.isCurrentUser ? '2px solid #000' : 'none'};

  @media (max-width: 768px) {
    font-size: 0.6rem;
    padding: 1px;
    min-height: 30px;
    min-width: 30px;
  }
`;

const WeekShiftTime = styled.div`
  font-weight: bold;
`;

const WeekShiftTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WeekDayColumn = styled.div`
  flex: 1;
  border-right: 1px solid #ddd;
  min-height: 100%;
  width: 20px;

  &:last-child {
    border-right: none;
  }
`;

const WeekDayColumnClickable = styled(WeekDayColumn)`
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;



const ShiftModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  z-index: 1000;
  width: 90%;
  max-width: 400px;

  @media (max-width: 480px) {
    padding: 15px;
    width: 95%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 15px;
    text-align: center;
  }
`;

const ModalDate = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  color: #666;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 15px;
     text-align: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justift-content: center;
  width: 70%;
  gap: 10px;
`;

const StyledButton = styled.button`
  display: inline-block;
  outline: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  border-radius: 500px;
  transition-property: background-color,border-color,color,box-shadow,filter;
  transition-duration: .3s;
  border: 1px solid transparent;
  letter-spacing: 2px;
  min-width: 160px;
  text-transform: uppercase;
  white-space: normal;
  font-weight: 700;
  text-align: center;
  padding: 16px 14px 18px;
  color: #616467;
  box-shadow: inset 0 0 0 2px #616467;
  background-color: transparent;
  height: 48px;

  &:hover {
    color: #fff;
    background-color: #616467;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    min-width: 120px;
    padding: 12px 10px 14px;
    height: 40px;
  }
`;

// daily

const DailyViewContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;

  @media (max-width: 768px) {
    padding: 10px;
    margin-top: 5px;
  }
`;

const DailyViewHeader = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`;

const WaiterCount = styled.p`
  font-style: italic;
  margin-top: 8px;
  margin-bottom: 8px;
  color: #444;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-top: 5px;
    margin-bottom: 5px;
  }
`;

const ShiftDetails = styled.div`
  background-color: white;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    padding: 8px;
    margin-bottom: 5px;
  }
`;

const ShiftTime = styled.p`
  font-weight: bold;
  margin-bottom: 3px;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 2px;
  }
`;

const ShiftTypeText = styled.p`
  color: #666;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ShiftSectionHeader = styled.h4`
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 5px;
  }
`;

const NoShiftsMessage = styled.p`
  font-size: 14px;
  color: #666;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const AddShiftButton = styled(StyledButton)`
  margin-top: 15px;
`;

const BackToWeekButton = styled(StyledButton)`
  margin-top: 15px;
`;

const NotificationContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(-20px)'};
  z-index: 1000;
`;


interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <NotificationContainer isVisible={isVisible}>
      {message}
    </NotificationContainer>
  );
};


const ShiftTypeOrder = ['morning', 'double', 'evening'] as const;
type ShiftType = typeof ShiftTypeOrder[number];

const ShiftTypeLabels: Record<ShiftType, string> = {
  morning: 'Day Shift',
  double: 'Double Shift',
  evening: 'Evening Shift'
};

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
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("week"));
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [notification, setNotification] = useState({ message: '', isVisible: false });

  const showNotification = useCallback((message: string) => {
    setNotification({ message, isVisible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const fetchAllShifts = useCallback(async () => {
    try {
      const response = await fetchShifts();
      console.log('Raw shifts response:', response.data);
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
      console.log('Formatted shifts:', formattedShifts);
    } catch (error: any) {
      console.error('Error fetching shifts:', error);
      showNotification(error.response?.data?.message || 'An error occurred while fetching shifts');
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAllShifts();
  }, [fetchAllShifts]);


  

  // notifications

  // others

  const handleDayClick = (day: moment.Moment) => {
    setSelectedDate(day);
  };

  const handleAddShift = async (shiftType: ShiftType) => {
    if (!selectedDate) return;

    const shiftDate = selectedDate;
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
      await createShift({
        date: shiftDate.format('YYYY-MM-DD'),
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftType
      });

      showNotification('Shift added successfully');
      fetchAllShifts();
      setShiftModal({ isOpen: false, date: null });
    } catch (error: any) {
      console.error('Error adding shift:', error);
      showNotification(error.response?.data?.message || 'Failed to add shift');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      navigate('/', { state: { message: 'You have been successfully logged out.' } });
    } catch (error: any) {
      console.error('Error logging out:', error);
      showNotification(error.response?.data?.message || 'Failed to log out');
    }
  };


  const getShiftColor = (shiftType: string) => {
    switch (shiftType) {
      case "morning":
        return "#4e79a7";
      case "evening":
        return "#f28e2c";
      case "double":
        return "#e15759";
      default:
        return "#76b7b2";
    }
  };


  // renders

  const renderWeekView = () => {
    const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => moment(currentWeek).add(i, "days"));
  
    console.log("Current week:", currentWeek.format('YYYY-MM-DD'));
    console.log("All shifts in state:", shifts);

    return (
      <WeekViewContainer>
        <WeekHeader>
          {weekDays.map((day, index) => (
            <WeekDayHeader key={index}>
              <WeekDayName>{day.format("ddd")}</WeekDayName>
              <WeekDayDate>{day.format("DD")}</WeekDayDate>
            </WeekDayHeader>
          ))}
        </WeekHeader>
        <WeekBody>
          {weekDays.map((day, dayIndex) => {
            const dayShifts = shifts.filter((shift) => moment(shift.start).isSame(day, 'day'));
            console.log(`Shifts for ${day.format('YYYY-MM-DD')}:`, dayShifts);

            const uniqueWaiters = new Set(dayShifts.map(shift => shift.userId));
            const totalWaiters = uniqueWaiters.size;
  
            return (
              <WeekDayColumnClickable 
                key={dayIndex} 
                onClick={() => handleDayClick(day)}
              >
                <div>Total waiters: {totalWaiters}</div>
                {dayShifts.map((shift) => (
                  <WeekShiftItem
                    key={shift.id}
                    color={getShiftColor(shift.shiftType)}
                    index={0}
                    isCurrentUser={shift.userId === currentUserId}
                  >
                    <WeekShiftTime>
                      {moment(shift.start).format("HH:mm")}
                    </WeekShiftTime>
                    <WeekShiftTitle>
                      {shift.userName}
                      {' - '}
                      {ShiftTypeLabels[shift.shiftType as ShiftType]}
                      {shift.userId === currentUserId && " (You)"}
                    </WeekShiftTitle>
                  </WeekShiftItem>
                ))}
              </WeekDayColumnClickable>
            );
          })}
        </WeekBody>
      </WeekViewContainer>
    );
  };

  const renderDailyView = () => {
    if (!selectedDate) return null;

    const dayShifts = shifts.filter((shift) => 
      moment(shift.start).isSame(selectedDate, 'day')
    );

    // Sort shifts
    const sortShifts = (shiftsToSort: Shift[]) => 
      shiftsToSort.sort((a, b) => 
        ShiftTypeOrder.indexOf(a.shiftType as ShiftType) - ShiftTypeOrder.indexOf(b.shiftType as ShiftType)
      );

    const sortedDayShifts = sortShifts(dayShifts);

    // Count unique waiters
    const uniqueWaiters = new Set(dayShifts.map(shift => shift.userId));
    const totalWaiters = uniqueWaiters.size;

    const canAddShift = !dayShifts.some(shift => shift.userId === currentUserId);

    return (
      <DailyViewContainer>
        <DailyViewHeader>{selectedDate.format("ddd, MMM D, YYYY")}</DailyViewHeader>
        <WaiterCount>Total waiters scheduled: {totalWaiters}</WaiterCount>
        
        <ShiftSectionHeader>All Shifts:</ShiftSectionHeader>
        {sortedDayShifts.length > 0 ? (
          sortedDayShifts.map((shift) => (
            <ShiftDetails key={shift.id}>
              <ShiftTime>
                {moment(shift.start).format("HH:mm")} - {moment(shift.end).format("HH:mm")}
              </ShiftTime>
              <ShiftTypeText>
                {shift.userName} - {ShiftTypeLabels[shift.shiftType as ShiftType]}
                {shift.userId === currentUserId && " (You)"}
              </ShiftTypeText>
            </ShiftDetails>
          ))
        ) : (
          <NoShiftsMessage>No shifts scheduled for this day</NoShiftsMessage>
        )}

        {canAddShift && (
          <AddShiftButton onClick={() => setShiftModal({ isOpen: true, date: selectedDate.toDate() })}>
            Add Your Shift
          </AddShiftButton>
        )}
        <BackToWeekButton onClick={() => setSelectedDate(null)}>
          Back to Week View
        </BackToWeekButton>
      </DailyViewContainer>
    );
  };



  return (
    <DashboardContainer>
      <HeaderContainer>
        <Header>Waiter Dashboard</Header>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </HeaderContainer>
      <CalendarContainer>
        <CalendarHeader>
          <NavButton onClick={() => setCurrentWeek(moment(currentWeek).subtract(7, "days"))}>
            Previous Week
          </NavButton>
          <CurrentMonthDisplay>
            {currentWeek.format('MMMM YYYY')}
          </CurrentMonthDisplay>
          <NavButton onClick={() => setCurrentWeek(moment(currentWeek).add(7, "days"))}>
            Next Week
          </NavButton>
        </CalendarHeader>
        <CalendarBody>
          {selectedDate ? renderDailyView() : renderWeekView()}
        </CalendarBody>
      </CalendarContainer>
      {shiftModal.isOpen && (
        <ShiftModal>
          <ModalTitle>Add Shift</ModalTitle>
          <ModalDate>{moment(shiftModal.date).format("dddd, MMMM D, YYYY")}</ModalDate>
          <ButtonContainer>
            {ShiftTypeOrder.map((shiftType) => (
              <StyledButton key={shiftType} onClick={() => handleAddShift(shiftType)}>
                {ShiftTypeLabels[shiftType]}
              </StyledButton>
            ))}
            <StyledButton onClick={() => setShiftModal({ isOpen: false, date: null })}>Cancel</StyledButton>
          </ButtonContainer>
        </ShiftModal>
      )}
      <Notification 
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </DashboardContainer>
  );
};

export default WaiterDashboard;