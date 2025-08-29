//src\types\State.ts

export interface State {
  id?: string;
  name: string;
  countryId: string;
}

export interface StateResponse {
  id: string;
  name: string;
  countryId: string;
}
export interface StategetResponse {
  id: string;
  name: string;
  countryId: string;
  countryname: string;
}


export interface StateDetailResponse {
  id: string;
  name: string;
  //created_at?: string;

}


