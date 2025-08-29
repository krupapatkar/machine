//src\types\City.ts

export interface City {
  id?: string;
  name: string;
  stateId: string;
}

export interface CityResponse {
  id: string;
  name: string;
  stateId: string;
}

export interface CityDetailResponse {
  id: string;
  name: string;
  //created_at?: string;
}


export interface CityGetResponse {
  id: string;
  name: string;
  stateId: string;
  statename: string;
}



