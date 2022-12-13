import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { SortableTree } from './SortableTree'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SortableTree indicator collapsible removable />
  </React.StrictMode>,
)
