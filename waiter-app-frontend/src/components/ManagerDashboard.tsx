import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  fetchShifts,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  logout,
  createShift,
  updateShift,
  deleteShift,
} from "../api";

// Set default axios configuration
axios.defaults.withCredentials = true;

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

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const SidePanel = styled.div`
  width: 100%;

  @media (min-width: 768px) {
    width: 300px;
  }
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
  gap: 10px; // Add some space between elements
`;

const CalendarBody = styled.div`
  display: flex;
  flex-direction: column;
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

// Update the WeekBody styled component
const WeekBody = styled.div`
  position: relative;
  min-height: 300px;
  display: flex;

  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

// Update the WeekShiftItem styled component
const WeekShiftItem = styled.div<{ color: string; index: number }>`
  background-color: ${(props) => props.color};
  color: white;
  padding: 2px;
  margin: 1px;
  border-radius: 3px;
  font-size: 0.7rem;
  overflow: hidden;
  cursor: pointer;
  height: 20px;

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

// Update the WeekDayColumn styled component (new)
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

const EditButton = styled(Button)`
  background-color: #ffa500;
  color: white;
  font-size: 0.8rem;
  padding: 5px 10px;
  margin-right: 5px;

  &:hover {
    background-color: #ff8c00;
  }
`;

const LogoutButton = styled(Button)`
  background-color: #dc3545;
  color: white;

  &:hover {
    background-color: #c82333;
  }
`;

// Update the Shift interface to include waiterName
interface Shift {
  id: number;
  title: string;
  start: Date;
  end: Date;
  userId: number;
  status: string;
  shiftType: "morning" | "evening" | "double";
  waiterName: string; // Add this line
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
  action: "remove" | "toggle" | null;
  newRole?: string;
}

interface ShiftModalState {
  isOpen: boolean;
  date: Date | null;
  selectedWaiter: number | null;
  shiftType: "morning" | "evening" | "double" | null;
  isWeekly: boolean;
}


interface EditShiftModalState {
  isOpen: boolean;
  shift: Shift | null;
}

const ManagerDashboard: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter",
  });
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
    isWeekly: false,
  });
  const [editShiftModal, setEditShiftModal] = useState<EditShiftModalState>({
    isOpen: false,
    shift: null,
  });
  const [waiters, setWaiters] = useState<User[]>([]);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<"week" | "month">(
    isMobile ? "week" : "month"
  );
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("week"));

  // Update useEffect
  useEffect(() => {
    fetchShiftsData();
    fetchUsersData();

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setView(mobile ? "week" : "month");
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call it initially to set the correct state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update the fetchShiftsData function to include the waiter's name
const fetchShiftsData = async () => {
  try {
    const response = await fetchShifts();
    const formattedShifts = response.data.map((shift: any) => ({
      id: shift.id,
      title: `${shift.user_name} - ${shift.shift_type}`,
      start: new Date(`${shift.date}T${shift.start_time}`),
      end: new Date(`${shift.date}T${shift.end_time}`),
      userId: shift.user_id,
      status: shift.status,
      shiftType: shift.shift_type,
      waiterName: shift.user_name, // Add this line to explicitly store the waiter's name
    }));
    setShifts(formattedShifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
  }
};
  const fetchUsersData = async () => {
    try {
      const response = await fetchUsers();
      setUsers(response.data);
      setWaiters(response.data.filter((user: User) => user.role === "waiter"));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      alert("User created successfully");
      setNewUser({ name: "", email: "", password: "", role: "waiter" });
      fetchUsersData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const openConfirmation = (
    userId: number,
    action: "remove" | "toggle",
    newRole?: string
  ) => {
    setConfirmation({ isOpen: true, userId, action, newRole });
  };

  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, userId: null, action: null });
  };

  const handleConfirm = async () => {
    if (!confirmation.userId || !confirmation.action) return;

    try {
      if (confirmation.action === "remove") {
        await deleteUser(confirmation.userId);
        alert("User has been removed successfully");
      } else if (confirmation.action === "toggle" && confirmation.newRole) {
        await updateUser(confirmation.userId, { role: confirmation.newRole });
        alert(`User's role has been updated to ${confirmation.newRole}`);
      }
      fetchUsersData();
    } catch (error) {
      console.error("Error performing action:", error);
      alert("Failed to perform action");
    }

    closeConfirmation();
  };

  const handleSlotSelect = (slotInfo: { start: Date }) => {
    openShiftModal(slotInfo.start);
  };

  // Ensure handleDayClick is defined as follows
const handleDayClick = (day: moment.Moment) => {
  openShiftModal(day.toDate());
};

// Make sure openShiftModal is defined correctly
const openShiftModal = (date: Date) => {
  setShiftModal({
    isOpen: true,
    date,
    selectedWaiter: null,
    shiftType: null,
    isWeekly: false,
  });
};


  
  const closeShiftModal = () => {
    setShiftModal({
      isOpen: false,
      date: null,
      selectedWaiter: null,
      shiftType: null,
      isWeekly: false,
    });
  };
  
  const handleAddShift = async () => {
    if (!shiftModal.selectedWaiter || !shiftModal.shiftType || !shiftModal.date) {
      alert("Please select a waiter and shift type");
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
      await createShift({
        user_id: shiftModal.selectedWaiter,
        date: shiftDate.format("YYYY-MM-DD"),
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftModal.shiftType,
      });

      alert("Shift added successfully");
      fetchShiftsData();
      closeShiftModal();
    } catch (error) {
      console.error("Error adding shift:", error);
      alert("Failed to add shift");
    }
  };


const handleShiftUpdate = (shift: Shift) => {
  setEditShiftModal({ isOpen: true, shift });
};


const handleEditShift = async (
  newShiftType: "morning" | "evening" | "double"
) => {
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
    fetchShiftsData();
    setEditShiftModal({ isOpen: false, shift: null });
  } catch (error) {
    console.error("Error updating shift:", error);
    alert("Failed to update shift");
  }
};

const handleRemoveShift = async () => {
  if (!editShiftModal.shift) return;
  try {
    await deleteShift(editShiftModal.shift.id);
    fetchShiftsData();
    setEditShiftModal({ isOpen: false, shift: null });
    alert("Shift removed successfully");
  } catch (error) {
    console.error("Error removing shift:", error);
    alert("Failed to remove shift");
  }
};

const handleLogout = async () => {
  try {
    await logout();
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/", {
      state: { message: "You have been successfully logged out." },
    });
  } catch (error) {
    console.error("Error logging out:", error);
    alert("Failed to log out");
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

 
// Update the renderWeekView function
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
                // Prevent opening the modal if clicking on a shift item
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
                    e.stopPropagation(); // Prevent the column click event
                    handleShiftUpdate(shift);
                  }}
                  className="shift-item" // Add this class
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
              onClick={() => handleSlotSelect({ start: date.toDate() })}
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
            <UserGroupTitle>
              {role.charAt(0).toUpperCase() + role.slice(1)}s
            </UserGroupTitle>
            {users.map((user) => (
              <UserItemWrapper key={user.id}>
                <UserItem>
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <UserActions>
                    <ToggleButton
                      onClick={() =>
                        openConfirmation(
                          user.id,
                          "toggle",
                          user.role === "waiter" ? "manager" : "waiter"
                        )
                      }
                    >
                      {user.role === "waiter" ? "Make Admin" : "Make Waiter"}
                    </ToggleButton>
                    <RemoveButton
                      onClick={() => openConfirmation(user.id, "remove")}
                    >
                      Remove
                    </RemoveButton>
                  </UserActions>
                </UserItem>
                {confirmation.isOpen && confirmation.userId === user.id && (
                  <ConfirmationPopup>
                    <ConfirmationText>
                      {confirmation.action === "remove"
                        ? `Are you sure you want to remove ${user.name}?`
                        : `Are you sure you want to change ${user.name}'s role to ${confirmation.newRole}?`}
                    </ConfirmationText>
                    <ConfirmationButtons>
                      <ConfirmButton onClick={handleConfirm}>
                        Confirm
                      </ConfirmButton>
                      <CancelButton onClick={closeConfirmation}>
                        Cancel
                      </CancelButton>
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
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
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
      </ContentContainer>
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
        <EditShiftModal>
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
        </EditShiftModal>
      )}
    </DashboardContainer>
  );
};

export default ManagerDashboard;
