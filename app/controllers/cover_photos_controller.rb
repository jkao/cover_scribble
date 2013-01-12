class CoverPhotosController < ApplicationController
  before_filter :authenticate_user!

  PHOTO_URL = "http://limitless-tundra-7937.herokuapp.com/cover_photos?user_id="

  def show
    @user = User.find_by_uid(params[:user_uid]) || not_found
    @profile_picture_url = profile_picture_url(@user.uid)
    @cover_photo = \
      CoverPhoto.joins(:user_cover_photo) \
                .where(:user_cover_photos => { :user_id => 1 }) \
                .order("created_at DESC").first

    respond_to do |format|
      format.html
      format.json {
        if @cover_photo
          cover_photo_json = {
            "url" => @cover_photo.url,
            "img_code" => @cover_photo.img_code
          }
        else
          cover_photo_json = nil
        end

        json = {
          "user" => {
            "name" => @user.name,
            "uid" => @user.uid,
            "id" => @user.id
          },
          "profile_picture_url" => @profile_picture_url,
          "cover_photo" => cover_photo_json
        }

        render :json => json
      }
    end
  end

  def create
    @access_token = params[:access_token]
    @image_url = params[:image_url]
    @image_code = params[:image_code]
    @drawer_id = current_user.id
    @user_id = params[:user_id]

    # find the respective users
    @drawer = User.find_by_id(@drawer_id)
    unless @drawer
      render(:json => { :errors => ["Drawer #{@drawer_id} doesn't exist!"] }) and return
    end

    @user = User.find_by_id(@user_id)
    unless @user
      render(:json => { :errors => ["User #{@user_id} doesn't exist!"] }) and return
    end

    @drawer.transaction do
      # create the cover photo
      @cover_photo = CoverPhoto.new
      @cover_photo.url = @image_url
      @cover_photo.img_code = @image_code
      unless @cover_photo.save
        render(:json => @cover_photo.errors) and return
      end

      # create the user cover photo relation
      @user_cover_photo = UserCoverPhoto.new
      @user_cover_photo.user_id = @user_id
      @user_cover_photo.drawer_id = @drawer_id
      @user_cover_photo.cover_photo_id = @cover_photo.id
      unless @user_cover_photo.save
        render(:json => @user_cover_photo.errors) and return
      end
    end

    photo_url = "#{PHOTO_URL}#{@user.uid}"

    if @user_id != @drawer_id
      # Upload the image from imgur
      @me = FbGraph::User.new('me',
                              :access_token => @access_token)
      photo = @me.photo!(:url => @image_url,
                         :message => "Write on my cover photo at #{photo_url}" )

      # Send out a success response
      successful_return = {
        :facebook_identifier => photo.identifier
      }
    else
      @fb_user = FbGraph::User.new(@user.uid,
                                   :access_token => @access_token)

      user.notification!(
        :access_token => APP_ACCESS_TOKEN,
        :href => photo_url,
        :template => "Your friend #{@drawer.name} drew on your cover photo!"
      )

      successful_return = {}
    end

    render(:json => successful_return)
  end

end
