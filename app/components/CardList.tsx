import { ReactNode } from "react";

const CardList = ({ children }: { children: ReactNode }) => {
  return <div className="bg-[grey] w-full p-4">{children}</div>;
};

export default CardList;
