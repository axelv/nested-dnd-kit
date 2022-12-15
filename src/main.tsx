import React from 'react'
import { createRoot } from 'react-dom/client'
import Document from './Document'
import './index.css'
import Library, { LibraryDnDContext } from './Library'


const container = document.getElementById('root')
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <div className='flex'>
      <LibraryDnDContext>
        <Document className='grow-[3]' />
        <Library />
      </LibraryDnDContext>
    </div >
  </React.StrictMode >,
)
