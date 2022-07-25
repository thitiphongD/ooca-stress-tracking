import Axios from "axios"
import React, { useState } from "react"

function StressCard(props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftLevel, setDraftLevel] = useState("")
  const [file, setFile] = useState()
  const [draftDescription, setDraftDescription] = useState("")

  async function submitHandler(e) {
    e.preventDefault()
    setIsEditing(false)
    props.setStress(prev =>
      prev.map(function (stress) {
        if (stress._id == props.id) {
          return { ...stress, stressLevel: draftLevel, description: draftDescription }
        }
        return stress
      })
    )
    const data = new FormData()
    if (file) {
      data.append("photo", file)
    }
    data.append("_id", props.id)
    data.append("level", draftLevel)
    data.append("description", draftDescription)
    const newPhoto = await Axios.post("/update-stress", data, { headers: { "Content-Type": "multipart/form-data" } })
    if (newPhoto.data) {
      props.setStress(prev => {
        return prev.map(function (stress) {
          if (stress._id == props.id) {
            return { ...stress, photo: newPhoto.data }
          }
          return stress
        })
      })
    }
  }

  return (
    <div className="card">
      <div className="our-card-top">
        {isEditing && (
          <div className="our-custom-input">
            <div className="our-custom-input-interior">
              <input onChange={e => setFile(e.target.files[0])} className="form-control form-control-sm" type="file" />
            </div>
          </div>
        )}
        <img src={props.photo ? `/uploaded-photos/${props.photo}` : "/fallback.png"} className="card-img-top" alt={`${props.description} named ${props.level}`} />
      </div>
      <div className="card-body">
        {!isEditing && (
          <>
            <h4>{props.stressLevel}</h4>
            <p className="text-muted small">{props.description}</p>
            {!props.readOnly && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setDraftLevel(props.level)
                    setDraftDescription(props.description)
                    setFile("")
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={async () => {
                    const test = Axios.delete(`/stress/${props.id}`)
                    props.setStress(prev => {
                      return prev.filter(stress => {
                        return stress._id != props.id
                      })
                    })
                  }}
                  className="btn btn-sm btn-outline-danger"
                >
                  Delete
                </button>
              </>
            )}
          </>
        )}
        {isEditing && (
          <form onSubmit={submitHandler}>
            <div className="mb-1">
              <input autoFocus onChange={e => setDraftLevel(e.target.value)} type="number" min="0" max="5" className="form-control form-control-sm" value={draftLevel} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftDescription(e.target.value)} type="text" className="form-control form-control-sm" value={draftDescription} />
            </div>
            <button className="btn btn-sm btn-success">Save</button>{" "}
            <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-outline-secondary">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default StressCard