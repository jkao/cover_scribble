class UserCoverPhoto < ActiveRecord::Base
  # associations
  belongs_to :user
  has_one :cover_photo
  belongs_to :user, :foreign_key => :drawer_id

  # validations
  validates_presence_of :user_id, :cover_photo_id, :drawer_id
end
