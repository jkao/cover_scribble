class UserCoverPhoto < ActiveRecord::Base
  # associations
  belongs_to :user, :foreign_key => :user_id
  belongs_to :cover_photo, :foreign_key => :cover_photo_id
  belongs_to :user, :foreign_key => :drawer_id

  # validations
  validates_presence_of :user_id, :cover_photo_id, :drawer_id
end
