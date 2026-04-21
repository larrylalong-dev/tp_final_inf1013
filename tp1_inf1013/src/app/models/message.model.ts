export interface Message {
  id: string;
  adId: string | number;
  ownerId: string;
  fromUserId: string;
  subject: string;
  body: string;
  createdAt: string;
}
