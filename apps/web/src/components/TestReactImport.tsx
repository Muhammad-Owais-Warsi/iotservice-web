// Simple test to verify React types are available
import * as React from 'react';

// This should compile without "Cannot find module 'react'" error
const element: React.ReactElement | null = null;

export default element;