import { useEffect } from 'react';
const ImportScript = (resourceUrl) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = resourceUrl;
    script.async = true;
    document.body.appendChild(script);
    console.log("script", script);
    return () => {
      document.body.removeChild(script);
    }
  }, [resourceUrl]);
};
export default ImportScript;