
export interface UserSession {
    socketId: string;
    gameId: string;
    nickName: string;
    host: boolean;
    conected: number;
    playerId: string;
}
  
export interface UserSessionResponse {
    gameId: string;
    nickName: string;
    host: boolean;
    playerId: string;
    owner: boolean;
}

export interface UserDisconected {
    nickName: string;
    playerId: string;
    conectedList: UserSessionResponse[];
}
  