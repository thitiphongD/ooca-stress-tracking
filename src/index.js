import React, { useState, useEffect } from "react"
import {createRoot} from "react-dom"
import Axios from "axios"
import CreateStressTrack from "./components/CreateStressTrack"
import StressCard from "./components/StressCard"


function App() {

    const [showStress, setStress] = useState([])

    useEffect(() => {
        async function go() {
            const response = await Axios.get("/api/getStress")
            setStress(response.data)
        }
        go()
    }, [])
    
    return (
        <div className="container">
            <CreateStressTrack setStress={setStress} />
            <div className="stress-grid">
                {showStress.map(function(stress) {
                    return <StressCard key={stress._id} stressLevel={stress.stressLevel} description={stress.description} photo={stress.photo} id={stress._id} setStress={setStress} />
                })}
            </div>    
        </div>
    )
}


const root = createRoot(document.querySelector("#app"))
root.render(<App />)
