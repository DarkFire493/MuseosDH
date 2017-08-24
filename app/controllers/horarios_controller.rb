class HorariosController < ApplicationController
  before_action :set_horario, only: [:show, :edit, :update, :destroy]

  # GET /horarios
  # GET /horarios.json
  def index
    @horarios = Horario.all
  end

  # GET /horarios/1
  # GET /horarios/1.json
  def show

  end

  # GET /horarios/new
  def new
    @horario = Horario.new
    @pet = Pet.find(params[:id])
  end

  # GET /horarios/1/edit
  def edit

  end

  # POST /horarios
  # POST /horarios.json
  def create
    @horario = Horario.new(horario_params)

    respond_to do |format|
      if @horario.save
        format.html { redirect_to pets_url}
        format.json { render :show, status: :created, location: @horario }
      else
        format.html { render :new }
        format.json { render json: @horario.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /horarios/1
  # PATCH/PUT /horarios/1.json
  def update
    respond_to do |format|
      if @horario.update(horario_params)
        format.html { redirect_to pets_url }
        format.json { render :show, status: :ok, location: @horario }
      else
        format.html { render :edit }
        format.json { render json: @horario.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /horarios/1
  # DELETE /horarios/1.json
  def destroy
    @horario.destroy
    respond_to do |format|
      format.html { pets_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_horario
      @horario = Horario.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def horario_params
      params.require(:horario).permit(:dia, :horai, :horaf, :pet_id)
    end
end
