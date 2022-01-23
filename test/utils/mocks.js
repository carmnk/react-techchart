const pointerEventCtorProps = ["clientX", "clientY", "pointerType", "touches", "pointerId", "buttons"];
export class PointerEventFake extends Event {
  constructor(type, props) {
    super(type, props);
    pointerEventCtorProps.forEach((prop) => {
      if (props?.[prop] != null) {
        const p = props[prop];
        this[prop] = props[prop];
      }
    });
  }
}

export const matchMediaMock = {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated/legacy
    removeListener: jest.fn(), // Deprecated/legacy
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
};
