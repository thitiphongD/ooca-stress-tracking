import Axios from "axios"
import React, { useState, useRef } from "react"


function CreateStressTrack(props) {

    const [stressLevel, setLevel] = useState("")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState("")
    const CreatePhotoField = useRef()

    async function submitHandler(e) {
        e.preventDefault()
        const data = new FormData()
        data.append("photo", file)
        data.append("stressLevel", stressLevel)
        data.append("description", description)
        setLevel("")
        setDescription("")
        setFile("")
        CreatePhotoField.current.value = ""
        const newPhoto = await Axios.post("/create-stress", data, { headers: { "Content-Type": "multipart/form-data" } })
        props.setStress(prev => prev.concat([newPhoto.data]))
    
}
    return (
        <form className="p-3 bg-success bg-opacity-25 mb-5" onSubmit={submitHandler}>
    
            <div className="mb-2">
                <input ref={CreatePhotoField} onChange={e => setFile(e.target.files[0])} type="file" className="form-control" />
            </div>
            <div className="mb-2">
                <input onChange={e => setLevel(e.target.value)}  type="number" min="0" max="5" className="form-control" placeholder="Stress Level" value={stressLevel}/>
            </div>
            <div className="mb-2">
                <input onChange={e => setDescription(e.target.value)} type="text" className="form-control" placeholder="Description" value={description}/>
            </div>

        <input type="submit" className="btn btn-success" value="Create New Track" />
        </form>
  )
}

export default CreateStressTrack