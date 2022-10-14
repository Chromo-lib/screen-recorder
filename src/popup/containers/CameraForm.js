import { h } from 'preact';

export default function CameraForm({ onChange, value }) {
  return <div class="w-100 d-flex align-center">
    <label htmlFor="cameraForm">Camera Form</label>
    <select class="ml-1" name="cameraForm" onChange={onChange} value={value} selected="circle">
      <option value='square'>square</option>      
      <option value='circle'>circle</option>
    </select>
  </div>
}
