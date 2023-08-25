import FeatherIcon from "feather-icons-react";

export default function Modal({
  show,
  className,
  id,
  children,
  onChange,
}: {
  show: boolean;
  className?: string;
  id: string;
  children: JSX.Element | JSX.Element[];
  onChange: () => void;
}) {
  return (
    <>
      <input
        type="checkbox"
        id={id}
        className="modal-toggle"
        checked={show}
        onChange={onChange}
      />
      <div className="modal">
        {show && (
          <div className={`modal-box relative ${className}`}>
            <label
              htmlFor={id}
              className="btn btn-sm btn-square absolute right-4 top-4"
            >
              <FeatherIcon icon="x" size="18" />
            </label>
            {children}
          </div>
        )}
      </div>
    </>
  );
}
