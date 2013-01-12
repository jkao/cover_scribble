class CoverPhoto < ActiveRecord::Base
  # associations
  belongs_to :user_cover_photo

  # validations
  validates_presence_of :url

end
