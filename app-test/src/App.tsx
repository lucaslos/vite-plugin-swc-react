import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { css } from '@linaria/core'
import { styled } from '@linaria/react'

const test = css`
  color: red;
`

const StyledTest = styled.div`
  color: blue;
`

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <a
          href="https://vitejs.dev"
          target="_blank"
          className={test}
        >
          <img
            src="/vite.svg"
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a
          href="https://reactjs.org"
          target="_blank"
        >
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React 5</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>

        <button
          onClick={() => {

            debugger

            console.log('hello23')

            debugger
          }}
        >
          Debug
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more

        <StyledTest>Test</StyledTest>
      </p>
    </div>
  )
}

export default App
