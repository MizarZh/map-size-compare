import ClientWrapper from "~/app/_components/client-wrapper";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <ClientWrapper />
    </HydrateClient>
  );
}
