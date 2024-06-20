import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import QRCode from "qrcode.react"; // Import QRCode component
import axios from 'axios';

interface Event {
  id: number;
  name: string;
  starts_on: string;
  image_banner: string;
  slug: string;
}

interface ResponseData {
  events: Event[];
}

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [qrCodes, setQrCodes] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get<Event[]>('https://kp-sign.misty-snow-54be.workers.dev/api/events');
        const eventData: Event[] = response.data;

        // Sort events by starts_on date
        const sortedEvents = [...eventData].sort((a, b) => {
          const dateA: Date = new Date(a.starts_on);
          const dateB: Date = new Date(b.starts_on);
          return dateA.getTime() - dateB.getTime();
        });

        setEvents(sortedEvents);
        generateQrCodes(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    // Fetch events initially
    fetchEvents();

    // Fetch events every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate QR codes based on the fetched events
    generateQrCodes(events);

    // Adjust currentEventIndex if the current event is removed
    if (events.length === 0 || currentEventIndex >= events.length) {
      setCurrentEventIndex(0); // Reset to the first event
    }
  }, [events]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prevIndex) =>
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [events]);

  const generateQrCodes = (events: Event[]) => {
    const qrCodes = events.map((event) => {
      return `https://kingsplayhouse.com/event-detail-page/?slug=${event.slug}`;
    });
    setQrCodes(qrCodes);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      {/* Box 1: App Header */}
      <Box
        sx={{
          backgroundColor: "#355E3B",
          color: "white",
          width: "100%",
          height: "10vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}
      >
        {events.length > 0 && (
          <div>
            <Typography variant="h3">
              {formatDate(events[currentEventIndex].starts_on)}
            </Typography>
          </div>
        )}
      </Box>

      <Box
        sx={{
          width: "100%",
          height: "90vh",
          position: "fixed",
          top: "10vh",
          left: 0,
          padding: "10px",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {events.length > 0 && (
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <img src={events[currentEventIndex].image_banner} alt={events[currentEventIndex].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: "16px", right: "16px" }}>
              <QRCode value={qrCodes[currentEventIndex]} size={150} style={{ opacity: 0.7 }} />
            </div>
          </div>
        )}
      </Box>
    </div>
  );
};

export default App;
