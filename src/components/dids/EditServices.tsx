import { useState } from "react";
import AnnotatedHeader from "../attested-default-content/annotatedHeader";
import { Service } from "@/types/dids";
import { InputProps } from "react-daisyui";
import * as z from "zod";

type Props = InputProps & {
  schema: z.Schema;
  label?: string;
  helpText?: string;
  errorMessage?: string;
  callback: ({ value, valid }: { value: string; valid: boolean }) => void;
};

export default function EditServices({
  existingServices,
  htmlId,
  save,
}: {
  existingServices: Service[];
  htmlId: string;
  save: (services: Service[]) => void;
}): JSX.Element {
  const [id, setId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [serviceEndpoint, setServiceEndpoint] = useState<string>("");
  const [services, setServices] = useState<Service[]>(existingServices);
  return (
    <div className="flex flex-col gap-y-2 text-base-content">
      <div>
        <AnnotatedHeader
          headerText="Edit Services"
          headerSize="text-xl"
          body="Means of communicating or interacting with the DID subject or associated entities via one or more service endpoints. Examples include discovery services, agent services, social networking services, file storage services, and verifiable credential repository services."
          externalDocsLink="https://www.w3.org/TR/did-core/#services"
          externalDocsDesc="Services Documentation"
        />
      </div>
      <div className="flex flex-col text-base-content gap-y-8">
        <div>
          <div className="flex items-end gap-x-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Id</span>
                <span className="label-text-alt text-xs text-base-content/30">
                  Required
                </span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="did:example:123#linked-domain"
                className={`input input-bordered w-full`}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Type</span>
                <span className="label-text-alt text-xs text-base-content/30">
                  Required
                </span>
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="LinkedDomains"
                className={`input input-bordered w-full`}
              />
            </div>
          </div>
          <div className="flex items-end gap-x-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Service endpoint</span>
                <span className="label-text-alt text-xs text-base-content/30">
                  Required
                </span>
              </label>
              <input
                type="text"
                value={serviceEndpoint}
                onChange={(e) => setServiceEndpoint(e.target.value)}
                placeholder="https://bar.example.com"
                className={`input input-bordered w-full`}
              />
            </div>
            <button
              disabled={!id || !type || !serviceEndpoint}
              className="btn"
              onClick={() => {
                //@ts-ignore
                setServices([
                  ...services,
                  {
                    id,
                    type,
                    serviceEndpoint,
                  },
                ]);
                setId("");
                setType("");
                setServiceEndpoint("");
              }}
            >
              Add Service
            </button>
          </div>
        </div>
        <div>
          <h3 className="mb-2">Services:</h3>
          {!services.length && <p className="text-xs">No services added yet</p>}
          <ul className="divide-y divide-solid divide-neutral divide-opacity-25">
            {[...services].map((service, i) => (
              <li key={i} className="font-mono text-xs py-2 truncate">
                <>
                  <button
                    className="btn btn-square btn-xs mr-4"
                    onClick={() =>
                      setServices(
                        [...services].filter((s) => s.id !== service.id)
                      )
                    }
                  >
                    X
                  </button>
                  <span className="text-base-content/50">Id:</span>{" "}
                  <span className="">{service.id}</span>{" "}
                  <span className="text-base-content/50">Type:</span>{" "}
                  {service.type}{" "}
                  <span className="text-base-content/50">
                    Service Endpoint:
                  </span>{" "}
                  {service.serviceEndpoint}
                </>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4`}
        onClick={() => {
          if (services.length) {
            save(services);
          } else {
            save([]);
          }
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
