import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";

export default function VideoInputs({ onChange, value }) {

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(enumerator => {
        const inputs = enumerator.filter(input => input.kind === "videoinput");
        setDevices(inputs);
      });
  }, []);

  return <select name="videoInput" onChange={onChange} value={value} selected={value}>
    <option value='default'>Default</option>
    {devices.map((d, i) => <option key={i} value={d.deviceId}>{d.label}</option>)}
  </select>
}
