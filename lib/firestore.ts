import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Player } from "./types";

export interface Squad {
  id: string;
  name: string;
  club?: string;
  version: "FM26" | "FM24";
  createdAt: Date;
  players: Player[];
}

export async function saveSquad(
  uid: string,
  name: string,
  version: "FM26" | "FM24",
  players: Player[],
  club?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "users", uid, "squads"), {
    name,
    club: club ?? null,
    version,
    createdAt: serverTimestamp(),
    players,
  });
  return ref.id;
}

export async function loadSquads(uid: string): Promise<Squad[]> {
  const q = query(
    collection(db, "users", uid, "squads"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    club: d.data().club ?? undefined,
    version: d.data().version,
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
    players: d.data().players,
  }));
}

export async function deleteSquad(uid: string, squadId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "squads", squadId));
}
