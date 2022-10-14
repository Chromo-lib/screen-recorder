import { h } from 'preact';
import { useMemo } from "preact/hooks";

export default function MimeTypes({ onChange, value }) {

  const mimeTypes = [
    'video/webm',
    'video/webm;codecs=vp8',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8.0',
    'video/webm;codecs=vp9.0',
    'video/webm;codecs=h264',
    'video/webm;codecs=H264',
    'video/webm;codecs=avc1',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=VP8,OPUS',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,vp9,opus',
    'video/webm;codecs=h264,opus',
    'video/webm;codecs=h264,vp9,opus',
    'video/x-matroska;codecs=avc1',
    // 'audio/webm',
    // 'audio/wav'
  ];

  const supported = useMemo(() => {
    return mimeTypes.filter(mimeType => {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType
      }
    });
  }, []);

  return <select onChange={onChange} value={value} name="mimeType">
    {supported.map((mimeType, i) => <option key={i} value={mimeType} selected={value === mimeType}>{mimeType}</option>)}
  </select>
}
