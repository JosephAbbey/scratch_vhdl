library ieee;
  use ieee.std_logic_1164.all;

entity lfsr_external is
  port(
    clk : in std_logic;
    reset : in std_logic;
    incr : in std_logic;
    buttons : in std_logic_vector(3 downto 0);
    leds : out std_logic_vector(3 downto 0)
  );
end entity;


architecture scratch of lfsr_external is

  constant button_tab_c : positive := 1;
  constant taps_c : std_logic_vector(3 downto 0) := "1100";

  signal run : std_logic;

  alias start is buttons(0);
  alias stop is buttons(1);

begin
-- Linear-Feedback Shift Register
-- In computing, a linear-feedback shift register
-- (LFSR) is a shift register whose input
-- bit is a linear function of its previous state.
-- Applications of LFSRs include generating
-- pseudo-random numbers, pseudo-noise sequences,
-- fast digital counters, and whitening sequences.
-- Both hardware and software implementations
-- of LFSRs are common.
-- https://en.wikipedia.org/wiki/Linear-feedback_shift_register#Example_polynomials_for_maximal_LFSRs
-- Usually the number of bits in the LFSR is
-- much larger than 4; this is for demonstration
-- purposes only.
-- Polynomial for maximal 4-bit LFSR
--          Taps x^ 4321 0
-- x^4 + x^3 + 1 => 1100(1)
-- Period (2^n - 1) = 15
-- Implementation Reference: https://www.eng.auburn.edu/~strouce/class/elec6250/LFSRs.pdf
-- External Feedback Implementation
-- ================================
--                  ++------+
--     +------------>\\      \  (x^4 + x^3)
--     |              || XOR  |---------------+
--     |          +->//      /                |
--     |          | ++------+                 |
--     |          |                           |
--     |          |                           |
--     |          |  LED bits(3:0)            |
--     |   +---+  | +---+    +---+    +---+   |
--     |   |   |  | |   |    |   |    |   |   |
-- <---+---+ 3 |<-+-| 2 |<---| 1 |<---| 0 |<--+
--         |   |    |   |    |   |    |   |
--         +---+    +---+    +---+    +---+
--      x^4      x^3      x^2      x^1      x^0

  process(clk)
  begin
    if rising_edge(clk) then
      if reset = '1' then
        run <= '0';
        -- Must not start as "0000", or it never changes!
        leds <= "1111";
      else
        if start = '1' then
          run <= '1';
        elsif stop = '1' then
          run <= '0';
        end if;
        if run = '1' and incr = '1' then
          -- External Feedback
          leds <= leds(2 downto 0) & (leds(3) xor leds(2));
        end if;
      end if;
    end if;
  end process;

end architecture;
