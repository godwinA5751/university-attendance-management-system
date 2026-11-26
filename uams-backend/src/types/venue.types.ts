
export interface CreateLectureVenueInput {
  venueName: string;
  latitude: number;
  longitude: number;
  allowedRadius: number;
}

export interface UpdateLectureVenueInput {
  venueName?: string;
  latitude?: number;
  longitude?: number;
  allowedRadius?: number;
  isActive?: boolean;
}
