class CoverPhoto < ActiveRecord::Base
  # associations
  has_one :user_cover_photo

  # validations
  validates_presence_of :url

end
