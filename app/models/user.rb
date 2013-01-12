class User < ActiveRecord::Base
  # associations
  has_many :user_cover_photos

  # validations
  validates_presence_of :provider, :uid, :name


  attr_accessible :provider, :uid, :name

  def self.create_with_omniauth(auth)
    create! do |user|
      user.provider = auth['provider']
      user.uid = auth['uid']
      if auth['info']
        user.name = auth['info']['name'] || ""
      end
    end
  end

end
