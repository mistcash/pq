"use client";

import { Avatar } from "~~/components/Avatar";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** Every registered User, with your own avatar up top. */
export const People = ({ me }: { me: string }) => {
  const { data: users } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "getUsers" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-3">
        <Avatar address={me} size={128} />
        <div>
          <h1 className="text-3xl font-bold m-0">Hi, it&apos;s you!</h1>
          <p className="text-base-content/70 m-0">{short(me)}</p>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        <h2 className="text-xl font-semibold m-0 px-5 pt-5 pb-2">
          People <span className="text-base-content/70 font-normal">{users?.length}</span>
        </h2>
        {users ? (
          <ul className="divide-y divide-base-300">
            {users.map(user => (
              <li key={user} className="flex items-center gap-4 px-5 py-3">
                <Avatar address={user} size={48} />
                <span className="font-medium truncate">{short(user)}</span>
                {user === me && <span className="badge badge-primary ml-auto">you</span>}
              </li>
            ))}
          </ul>
        ) : (
          <span className="loading loading-dots mx-auto my-6" />
        )}
      </div>
    </div>
  );
};
