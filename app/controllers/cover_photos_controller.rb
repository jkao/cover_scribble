class CoverPhotosController < ApplicationController
  before_filter :authenticate_user!

  # TODO: Implement security to check for friends
  def show
    @user = User.find_by_uid(params[:user_uid]) || not_found
    @profile_picture_url = profile_picture_url(@user.uid)
  end

  def create
    @access_token = params[:access_token]
    @image_url = params[:image_url]
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

    # Upload the image from imgur
    @me = FbGraph::User.new('me',
                            :access_token => @access_token)
    photo = @me.photo!(:url => @image_url)
                       #:message => "Want to join the Scribble fun? [GO TO THIS URL]" )
                       # TODO: Re-enable above line ^

    logger.info "WOOT"
    logger.info photo.inspect

    # Send out a success response
    successful_return = {
      :facebook_identifier => photo.identifier
    }

    render(:json => successful_return)
  end

end
