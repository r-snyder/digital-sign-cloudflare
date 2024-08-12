import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import QRCode from "qrcode.react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Define the Event type
interface Event {
  id: number;
  name: string;
  starts_on: string;
  supabase_image_banner: string;
  slug: string;
}

const SUPABASE_URL = 'https://bhnjrokjuvogahusomgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmpyb2tqdXZvZ2FodXNvbWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyMzcyNDcsImV4cCI6MjAzNDgxMzI0N30.lh6t4W5oSLqGvOmBwO-F5d_ORvNphl0TnCBmpwdzaXQ';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [qrCodes, setQrCodes] = useState<string[]>([]);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('starts_on', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error.message);
      return;
    }

    const eventsData = data || [];
    setEvents(eventsData);
    generateQrCodes(eventsData);
  };

  // Generate QR codes for the events
  const generateQrCodes = (events: Event[]) => {
    const qrCodes = events.map((event) => {
      return `https://kingsplayhouse.com/event-detail-page/?slug=${event.slug}`;
    });
    setQrCodes(qrCodes);
  };

  // Fetch events initially
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle changes from Supabase
  useEffect(() => {
    const handleChange = (payload: any) => {
      console.log('Change received!', payload);
      fetchEvents(); // Refresh events data on change
    };

    // Subscribe to INSERT, UPDATE, and DELETE events
    const insertChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, handleChange)
      .subscribe();

    const updateChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' }, handleChange)
      .subscribe();

    const deleteChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' }, handleChange)
      .subscribe();

    return () => {
      // Unsubscribe when the component unmounts
      insertChannel.unsubscribe();
      updateChannel.unsubscribe();
      deleteChannel.unsubscribe();
    };
  }, []);

  // Update the current event index periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prevIndex) =>
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000); // Change event every 15 seconds

    return () => clearInterval(interval);
  }, [events]);

  // Format date to a readable format
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
            <img src={events[currentEventIndex].supabase_image_banner} alt={events[currentEventIndex].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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