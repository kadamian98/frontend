import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import axios from "axios";

const FindRoomsDashboard = () => {
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSessions, setSelectedSessions] = useState(1);
  const [selectedTimes, setSelectedTimes] = useState(["", ""]);
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    axios.get("/api/faculties").then((res) => setFaculties(res.data));
    axios.get("/api/rooms").then((res) => setRooms(res.data));
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get("/api/schedules");
      const schedules = response.data;
      
      const filteredRooms = rooms.filter((room) => {
        return selectedTimes.every((time) =>
          !schedules.some(
            (schedule) =>
              schedule.day === selectedDay &&
              schedule.startTime === time &&
              schedule.room === room.name
          )
        );
      });

      setAvailableRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5">Buscar Salones Libres</Typography>
      
      <Select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} displayEmpty>
        <MenuItem value="" disabled>Selecciona una Facultad</MenuItem>
        {faculties.map((faculty) => (
          <MenuItem key={faculty._id} value={faculty.name}>{faculty.name}</MenuItem>
        ))}
      </Select>

      <Select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} displayEmpty>
        <MenuItem value="" disabled>Selecciona un Día</MenuItem>
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((day) => (
          <MenuItem key={day} value={day}>{day}</MenuItem>
        ))}
      </Select>
      
      <Select value={selectedSessions} onChange={(e) => {
        setSelectedSessions(e.target.value);
        setSelectedTimes(new Array(e.target.value).fill(""));
      }}>
        {[1, 2].map((num) => (
          <MenuItem key={num} value={num}>{num} Sesión(es)</MenuItem>
        ))}
      </Select>
      
      {[...Array(selectedSessions)].map((_, index) => (
        <Select key={index} value={selectedTimes[index]} onChange={(e) => {
          const newTimes = [...selectedTimes];
          newTimes[index] = e.target.value;
          setSelectedTimes(newTimes);
        }} displayEmpty>
          <MenuItem value="" disabled>Selecciona un Horario</MenuItem>
          {[700, 820, 1000, 1130, 1300, 1500].map((time) => (
            <MenuItem key={time} value={time}>{`${time} hrs`}</MenuItem>
          ))}
        </Select>
      ))}
      
      <TextField
        label="Capacidad del Salón"
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />

      <Button variant="contained" onClick={handleSearch}>Buscar Salones</Button>
      
      {availableRooms.length > 0 && (
        <Box>
          <Typography variant="h6">Salones Disponibles:</Typography>
          {availableRooms.map((room) => (
            <Typography key={room._id}>{room.name}</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FindRoomsDashboard;
