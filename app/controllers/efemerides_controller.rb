class EfemeridesController < ApplicationController
  before_action :set_efemeride, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!, except:[ :index ]
  # GET /efemerides
  # GET /efemerides.json
  def index
    @efemerides = Efemeride.all
  end

  # GET /efemerides/1
  # GET /efemerides/1.json
  def show
  end

  # GET /efemerides/new
  def new
    @efemeride = Efemeride.new
  end

  # GET /efemerides/1/edit
  def edit
  end

  # POST /efemerides
  # POST /efemerides.json
  def create
    @efemeride = Efemeride.new(efemeride_params)

    respond_to do |format|
      if @efemeride.save
        format.html { redirect_to @efemeride, notice: 'Efemeride ha sido creada.' }
        format.json { render :show, status: :created, location: @efemeride }
      else
        format.html { render :new }
        format.json { render json: @efemeride.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /efemerides/1
  # PATCH/PUT /efemerides/1.json
  def update
    respond_to do |format|
      if @efemeride.update(efemeride_params)
        format.html { redirect_to @efemeride, notice: 'Efemeride ha sido actualizada.' }
        format.json { render :show, status: :ok, location: @efemeride }
      else
        format.html { render :edit }
        format.json { render json: @efemeride.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /efemerides/1
  # DELETE /efemerides/1.json
  def destroy
    @efemeride.destroy
    respond_to do |format|
      format.html { redirect_to efemerides_url, notice: 'Efemeride ha sido eliminada.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_efemeride
      @efemeride = Efemeride.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def efemeride_params
      params.require(:efemeride).permit(:numero, :descripcion)
    end
end
