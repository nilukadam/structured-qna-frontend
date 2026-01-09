import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error("ErrorBoundary:", error, info); }

  render(){
    if (this.state.hasError) {
      return (
        <div className="container my-5">
          <div className="alert alert-danger">
            <strong>Something went wrong.</strong>
            <div className="small mt-1">{this.state.error?.message || "Unexpected error"}</div>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
