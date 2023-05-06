import { DidController } from "@/lib/DidDocument";
import { useState } from "react";

export default function EditDidController(
  {
    existingControllers,
    subject,
    htmlId,
    save,
  }: {
    existingControllers: DidController,
    subject,
    htmlId: string;
    save: (controller: DidController) => void;
  }
): JSX.Element {
  const [newId, setNewId] = useState<string>("");
  const [controllers, setControllers] = useState<DidController>(existingControllers);
  const [isSubject, setIsSubject] = useState<boolean>(false);
  return (
    <div>
      <h3 className="text-lg font-bold">Edit DID Controller</h3>
      <div className="flex flex-col gap-y-8 text-base-content">
        <div>
          <div className="form-control mt-8">
            <label className="label cursor-pointer justify-start gap-x-4">
              <span className="label-text">Same as DID Subject</span>
              <input type="checkbox" className="toggle"
                checked={isSubject}
                onChange={() => {
                  setIsSubject(!isSubject);
                }}
              />
            </label>
          </div>
          <div className="divider">OR</div>
          <div className={`${isSubject ? "opacity-25" : ""}`}>
            <div className="flex items-end gap-x-4">

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Add other Controller</span>
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  disabled={isSubject}
                  placeholder="did:web:..."
                  className={`input input-bordered w-full`}
                />
              </div>

              <button
                disabled={isSubject || !newId || newId.length < 1}
                className="btn"
                onClick={() => {
                  setControllers(new Set([...controllers, newId]))
                  setNewId("")
                }}
              >
                Add Controller
              </button>
            </div>
            <ul className="my-4 divide-y divide-solid divide-neutral divide-opacity-25">
              {[...controllers].map((controller, i) => <li key={i} className="font-mono text-xs py-2 truncate">
                <button className="btn btn-square btn-xs mr-4" onClick={() => setControllers(new Set([...controllers].filter(c => c !== controller)))}>X</button>{controller
                }</li>)}
            </ul>
          </div>
        </div>
        <label
          htmlFor={htmlId}
          className={`btn btn-info btn-outline btn-block mt-4`}
          onClick={() => {
            if (isSubject) {
              save(new Set([subject]))
            } else if (controllers.size > 0) {
              save(controllers)
            } else {
              save(new Set([]))
            }
          }}
        >
          Save to Document
        </label>
      </div>
    </div>
  )
}
