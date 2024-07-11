
export type BookListing = {
  id: number;
  owner?: User;
  buyer?: User;
  name: string;
  author: string;
  image: string | null;
  price: number | string;
  edition: number;
  condition: string;
  class_number?: string;
  professor?: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  profile_picture: string | null;
  phone_number: string | null;
  university: University | null;
  seller_rating: Rating;
  buyer_rating: Rating;
};

export type Rating = number|"No Ratings";

export type MeetupRequest = {
  id: number;
  book_listing: BookListing;
  user: User;
  status: string;
  location_latitude: string;
  location_longitude: string;
  meetup_time: Date;
};


export type University = {
  id: number;
  name: string;
  country?: string;
  alpha_two_code?: string;
}