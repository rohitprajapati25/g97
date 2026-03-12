import axios from "axios";

// Detect environment - use local for development, live for production
const isLocal = window.location.hostname === "localhost" || window.location.hostname
