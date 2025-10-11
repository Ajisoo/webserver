import React, {useState} from 'react';
import ScheduleInstance from '../component/ScheduleInstance';
import api from '../util';

export default function Schedule() {
  const [inputValue, setInputValue] = useState('d0501890-7afa-48f1-9097-39960b2fa80f');
  const [scheduleContent, setScheduleContent] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetCode = (clientId) => {
    if (inputValue.trim() === '') return;
    setLoading(true);
    setError('');
    setScheduleContent(null);
    api(`/schedule/${clientId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Schedule not found');
        }
        return response.json();
      })
      .then(data => {
        setScheduleContent(data);
        setLoading(false);
        setError('');
      })
      .catch(err => {
        setError(err.message);
        setScheduleContent(null);
        setLoading(false);
      });
  };

  let content;
  if (isLoading) {
    content = <p>Loading...</p>
  } else if (error) {
    content = <p style={{color: "red"}}>{error}</p>
  } else if (scheduleContent) {
    content = <ScheduleInstance scheduleContent={scheduleContent}/>
  } else {
    content = <div/>;
  }

  return (
    <div style={{padding: "10px"}}>
      <h1>Schedule</h1>
      <input
        type="text"
        placeholder="Enter id"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={() => handleSetCode(inputValue)}>Search</button>
      <div>
        {content}
      </div>
    </div>
  );
};
