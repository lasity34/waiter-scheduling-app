import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { useLocation } from 'react-router-dom';
import styled from "styled-components";
import { fetchShifts, createShift, updateShift, deleteShift, fetchUsers } from "../api";
import { useNotification } from './NotificationSystem';

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

const CurrentMonthDisplay = styled.span`
  font-size: 1rem;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
`;

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

  @media (max-width: 325px) {
    padding: 3px 1px;
    max-width: 25px;
  }
`;

const WeekDayName = styled.div`
  font-weight: bold;
  font-size: 0.8rem;

  @media (max-width: 325px) {
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

const WeekShiftItem = styled.div<{ color: string; index: number }>`
  background-color: ${(props) => props.color};
  color: white;
  padding: 2px;
  margin: 1px;
  border-radius: 3px;
  font-size: 0.7rem;
  overflow: hidden;
  cursor: pointer;
  height: 40px;

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

const MonthViewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #ddd;
`;

const MonthDayName = styled.div`
  background-color: #f0f0f0;
  padding: 5px;
  text-align: center;
  font-weight: bold;
  font-size: 0.8rem;
`;

const MonthDayCell = styled.div<{ isCurrentMonth: boolean }>`
  background-color: ${(props) => (props.isCurrentMonth ? "white" : "#f5f5f5")};
  min-height: 40px;
  padding: 2px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    background-color: #e6e6e6;
  }
`;

const MonthDayCellHeader = styled.div`
  font-weight: bold;
  font-size: 0.8rem;
`;

const MonthShiftIndicator = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  margin-top: 2px;
`;

const ShiftModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const ModalSelect = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

const EditButton = styled(ModalButton)`
  background-color: #ffa500;

  &:hover {
    background-color: #ff8c00;
  }
`;


interface Shift {
    id: number;
    title: string;
    start: Date;
    end: Date;
    userId: number;
    status: string;
    shiftType: "morning" | "evening" | "double";
    waiterName: string;
  }
  
  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }
  
  const ShiftManagement: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [waiters, setWaiters] = useState<User[]>([]);
    const [currentWeek, setCurrentWeek] = useState(moment().startOf("week"));
    const [view, setView] = useState<"week" | "month">("week");
    const [shiftModal, setShiftModal] = useState({
      isOpen: false,
      date: null as Date | null,
      selectedWaiter: null as number | null,
      shiftType: null as "morning" | "evening" | "double" | null,
    });
    const [editShiftModal, setEditShiftModal] = useState({
      isOpen: false,
      shift: null as Shift | null,
    });
    const { showNotification } = useNotification();
    const location = useLocation();


    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        const date = moment(dateParam);
        if (date.isValid()) {
          setCurrentWeek(date.startOf('week'));
        }
      }
    }, [location]);
  
    const fetchShiftsData = useCallback(async () => {
      try {
        const response = await fetchShifts();
        if (response && response.data && Array.isArray(response.data)) {
          const formattedShifts = response.data.map((shift: any) => ({
            id: shift.id,
            title: `${shift.user_name} - ${shift.shift_type}`,
            start: new Date(`${shift.date}T${shift.start_time}`),
            end: new Date(`${shift.date}T${shift.end_time}`),
            userId: shift.user_id,
            status: shift.status,
            shiftType: shift.shift_type,
            waiterName: shift.user_name,
          }));
          setShifts(formattedShifts);
        } else {
          console.error('Unexpected response format:', response);
          showNotification("Failed to fetch shifts: Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
        showNotification("Failed to fetch shifts");
      }
    }, [showNotification]);
  


    const fetchWaitersData = useCallback(async () => {
      try {
        const response = await fetchUsers();
        if (response && response.data && Array.isArray(response.data)) {
          setWaiters(response.data.filter((user: User) => user.role === "waiter"));
        } else {
          console.error('Unexpected response format:', response);
          showNotification("Failed to fetch waiters: Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        showNotification("Failed to fetch waiters");
      }
    }, [showNotification]);
  


    useEffect(() => {
  fetchShiftsData();
  fetchWaitersData();
}, [fetchShiftsData, fetchWaitersData, currentWeek]);
  
  
  
    const handleDayClick = (day: moment.Moment) => {
      setShiftModal({
        isOpen: true,
        date: day.toDate(),
        selectedWaiter: null,
        shiftType: null,
      });
    };
  
    const closeShiftModal = () => {
      setShiftModal({
        isOpen: false,
        date: null,
        selectedWaiter: null,
        shiftType: null,
      });
    };
  
    const handleAddShift = async () => {
      if (!shiftModal.selectedWaiter || !shiftModal.shiftType || !shiftModal.date) {
        showNotification("Please select a waiter and shift type");
        return;
      }
  
      const shiftDate = moment(shiftModal.date);
      let startTime, endTime;
  
      switch (shiftModal.shiftType) {
        case "morning":
          startTime = "09:00";
          endTime = "17:00";
          break;
        case "evening":
          startTime = "17:00";
          endTime = "01:00";
          break;
        case "double":
          startTime = "09:00";
          endTime = "01:00";
          break;
      }
  
      try {
        const response = await createShift({
          user_id: shiftModal.selectedWaiter,
          date: shiftDate.format("YYYY-MM-DD"),
          start_time: startTime,
          end_time: endTime,
          shift_type: shiftModal.shiftType,
        });
  
        if (response.status === 201) {
          showNotification("Shift added successfully. Email notifications have been sent.");
        } else {
          showNotification("Shift added successfully, but there was an issue with email notifications.");
        }
  
        fetchShiftsData();
        closeShiftModal();
      } catch (error: any) {
        console.error("Error adding shift:", error);
        showNotification(error.response?.data?.message || "Failed to add shift");
      }
    };
  
  
    const handleShiftUpdate = (shift: Shift) => {
      setEditShiftModal({ isOpen: true, shift });
    };
  
    const handleEditShift = async (newShiftType: "morning" | "evening" | "double") => {
      if (!editShiftModal.shift) return;
      let startTime, endTime;
      switch (newShiftType) {
        case "morning":
          startTime = "09:00";
          endTime = "17:00";
          break;
        case "evening":
          startTime = "17:00";
          endTime = "01:00";
          break;
        case "double":
          startTime = "09:00";
          endTime = "01:00";
          break;
      }
      try {
        await updateShift(editShiftModal.shift.id, {
          shift_type: newShiftType,
          start_time: startTime,
          end_time: endTime,
        });
        showNotification("Shift updated successfully");
        fetchShiftsData();
        setEditShiftModal({ isOpen: false, shift: null });
      } catch (error: any) {
        console.error("Error updating shift:", error);
        showNotification(error.response?.data?.message || "Failed to update shift");
      }
    };
  
    const handleRemoveShift = async () => {
      if (!editShiftModal.shift) return;
      try {
        await deleteShift(editShiftModal.shift.id);
        showNotification("Shift removed successfully");
        fetchShiftsData();
        setEditShiftModal({ isOpen: false, shift: null });
      } catch (error: any) {
        console.error("Error removing shift:", error);
        showNotification(error.response?.data?.message || "Failed to remove shift");
      }
    };
  
  
    const renderWeekView = () => {
      const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => moment(currentWeek).add(i, "days"));
  
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
              return (
                <WeekDayColumnClickable 
                  key={dayIndex} 
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.shift-item')) {
                      handleDayClick(day);
                    }
                  }}
                >
                  {dayShifts.map((shift, shiftIndex) => (
                    <WeekShiftItem
                      key={shift.id}
                      color={getShiftColor(shift.shiftType)}
                      index={shiftIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShiftUpdate(shift);
                      }}
                      className="shift-item"
                    >
                      <WeekShiftTime>
                        {moment(shift.start).format("HH:mm")}
                      </WeekShiftTime>
                      <WeekShiftTitle>{shift.title.split(" - ")[0]}</WeekShiftTitle>
                    </WeekShiftItem>
                  ))}
                </WeekDayColumnClickable>
              );
            })}
          </WeekBody>
        </WeekViewContainer>
      );
    };

    
    const renderMonthView = () => {
        const startDate = moment(currentWeek).startOf("month").startOf("week");
        const endDate = moment(currentWeek).endOf("month").endOf("week");
        const days = [];
    
        let day = startDate.clone();
        while (day.isSameOrBefore(endDate)) {
          days.push(day.clone());
          day.add(1, "day");
        }
    
        return (
          <MonthViewContainer>
            {["S", "M", "T", "W", "T", "F", "S"].map((dayName) => (
              <MonthDayName key={dayName}>{dayName}</MonthDayName>
            ))}
            {days.map((date, index) => {
              const dayShifts = shifts.filter((shift) =>
                moment(shift.start).isSame(date, "day")
              );
              return (
                <MonthDayCell
                  key={index}
                  isCurrentMonth={date.isSame(currentWeek, "month")}
                  onClick={() => handleDayClick(date)}
                >
                  <MonthDayCellHeader>{date.format("D")}</MonthDayCellHeader>
                  {dayShifts.length > 0 && (
                    <MonthShiftIndicator
                      color={getShiftColor(dayShifts[0].shiftType)}
                    >
                      {dayShifts.length}
                    </MonthShiftIndicator>
                  )}
                </MonthDayCell>
              );
            })}
          </MonthViewContainer>
        );
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
    
      const renderCalendarView = () => {
        switch (view) {
          case "week":
            return renderWeekView();
          case "month":
          default:
            return renderMonthView();
        }
      };
    
      return (
        <div>
          <CalendarContainer>
            <CalendarHeader>
              <NavButton
                onClick={() =>
                  setCurrentWeek(moment(currentWeek).subtract(1, "week"))
                }
              >
                Previous Week
              </NavButton>
              <CurrentMonthDisplay>
                {currentWeek.format('MMMM YYYY')}
              </CurrentMonthDisplay>
              <NavButton
                onClick={() => setCurrentWeek(moment(currentWeek).add(1, "week"))}
              >
                Next Week
              </NavButton>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as "week" | "month")}
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </CalendarHeader>
            <CalendarBody>{renderCalendarView()}</CalendarBody>
          </CalendarContainer>
          {shiftModal.isOpen && (
            <ShiftModal>
              <h3>Add Shift</h3>
              <p>Selected Date: {moment(shiftModal.date).format("dddd, MMMM D, YYYY")}</p>
              <ModalSelect
                value={shiftModal.selectedWaiter || ""}
                onChange={(e) =>
                  setShiftModal({
                    ...shiftModal,
                    selectedWaiter: Number(e.target.value),
                  })
                }
              >
                <option value="">Select Waiter</option>
                {waiters.map((waiter) => (
                  <option key={waiter.id} value={waiter.id}>
                    {waiter.name}
                  </option>
                ))}
              </ModalSelect>
              <ModalSelect
                value={shiftModal.shiftType || ""}
                onChange={(e) =>
                  setShiftModal({
                    ...shiftModal,
                    shiftType: e.target.value as "morning" | "evening" | "double",
                  })
                }
              >
                <option value="">Select Shift Type</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="double">Double</option>
              </ModalSelect>
              <ModalButton onClick={handleAddShift}>Add Shift</ModalButton>
              <ModalButton onClick={closeShiftModal}>Cancel</ModalButton>
            </ShiftModal>
          )}
          {editShiftModal.isOpen && editShiftModal.shift && (
            <ShiftModal>
              <h3>Edit Shift</h3>
              <p>Current shift: {editShiftModal.shift.title}</p>
              <p>Date: {moment(editShiftModal.shift.start).format("dddd, MMMM D, YYYY")}</p>
              <ModalSelect
                value={editShiftModal.shift.shiftType}
                onChange={(e) =>
                  handleEditShift(
                    e.target.value as "morning" | "evening" | "double"
                  )
                }
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="double">Double</option>
              </ModalSelect>
              <EditButton onClick={() => handleEditShift(editShiftModal.shift!.shiftType)}>
                Update Shift
              </EditButton>
              <ModalButton onClick={handleRemoveShift}>Remove Shift</ModalButton>
              <ModalButton
                onClick={() => setEditShiftModal({ isOpen: false, shift: null })}
              >
                Cancel
              </ModalButton>
            </ShiftModal>
          )}
        </div>
      );
    };
    
    export default ShiftManagement;