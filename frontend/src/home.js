import React, {useState, useEffect} from 'react';

export default function Home () {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scheduling/apple', {
      method: 'GET'
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setData(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (<h1>Loading...</h1>);
  } else {
    return (<h1>{data.name}</h1>);
  }
}
