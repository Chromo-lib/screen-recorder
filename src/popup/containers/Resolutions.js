import { h } from 'preact';
import Hd from '../components/icons/Hd';
import resolutions from "../utils/resolutions";

export default function Resolutions({ onChange, value }) {

  return <div class="w-100 d-flex align-center">
    <Hd />
    <label htmlFor="resolution">Resolutions</label>
    <select class="ml-1" name="resolution" onChange={onChange} value={value} selected={value}>
      {resolutions.map((rs, i) => <option key={i} value={rs}>{rs}</option>)}
    </select>
  </div>
}