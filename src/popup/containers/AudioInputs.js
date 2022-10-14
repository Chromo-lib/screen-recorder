import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";

export default function AudioInputs({ onChange, value }) {

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(enumerator => {
        const inputs = enumerator.filter(input => input.kind === "audioinput");
        setDevices(inputs);
      });
  }, []);

  return <select name="audioInput" onChange={onChange} value={value} selected={value}>
    {devices.map((d, i) => <option key={i} value={d.deviceId}>{d.label}</option>)}
  </select>
}