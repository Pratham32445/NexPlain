```python
from manim import *

class BubbleSortVisualization(Scene):
    def construct(self):
        # Setup scene
        self.camera.background_color = "#1e1e1e"
        self.setup_initial_scene()
        self.introduce_bubble_sort()
        self.explain_theory()
        self.demonstrate_with_example()
        self.step_by_step_analysis()
        self.conclude()

    def setup_initial_scene(self):
        # Create title
        title = Text("Bubble Sort Algorithm", font_size=48, color=WHITE)
        subtitle = Text("Step-by-Step Visualization", font_size=32, color=BLUE)

        # Position title
        title.to_edge(UP)
        subtitle.next_to(title, DOWN, buff=0.5)

        # Animate title
        self.play(Write(title), run_time=3)
        self.wait(2)
        self.play(Write(subtitle), run_time=2)
        self.wait(2)

        # Clear scene for next part
        self.play(FadeOut(title), FadeOut(subtitle), run_time=1)
        self.wait(1)

    def introduce_bubble_sort(self):
        # Introduction to bubble sort
        intro_text = Text("Bubble Sort is a simple sorting algorithm", font_size=36, color=WHITE)
        intro_text2 = Text("that repeatedly steps through the list", font_size=36, color=WHITE)
        intro_text3 = Text("comparing adjacent elements and swapping them", font_size=36, color=WHITE)
        intro_text4 = Text("if they are in the wrong order", font_size=36, color=WHITE)

        # Position text
        intro_text.next_to(ORIGIN, UP*2)
        intro_text2.next_to(intro_text, DOWN, buff=0.3)
        intro_text3.next_to(intro_text2, DOWN, buff=0.3)
        intro_text4.next_to(intro_text3, DOWN, buff=0.3)

        # Animate text
        self.play(Write(intro_text), run_time=2)
        self.wait(1)
        self.play(Write(intro_text2), run_time=2)
        self.wait(1)
        self.play(Write(intro_text3), run_time=2)
        self.wait(1)
        self.play(Write(intro_text4), run_time=2)
        self.wait(3)

        # Clear scene for next part
        self.play(FadeOut(intro_text), FadeOut(intro_text2), FadeOut(intro_text3), FadeOut(intro_text4), run_time=1)
        self.wait(1)

    def explain_theory(self):
        # Theory explanation
        theory_text = Text("How Bubble Sort Works:", font_size=40, color=YELLOW)
        step1 = Text("1. Compare adjacent elements", font_size=32, color=GREEN)
        step2 = Text("2. If they are in the wrong order, swap them", font_size=32, color=GREEN)
        step3 = Text("3. Repeat until the list is sorted", font_size=32, color=GREEN)

        # Position text
        theory_text.to_edge(UP)
        step1.next_to(theory_text, DOWN, buff=0.5)
        step2.next_to(step1, DOWN, buff=0.3)
        step3.next_to(step2, DOWN, buff=0.3)

        # Animate text
        self.play(Write(theory_text), run_time=2)
        self.wait(1)
        self.play(Write(step1), run_time=2)
        self.wait(1)
        self.play(Write(step2), run_time=2)
        self.wait(1)
        self.play(Write(step3), run_time=2)
        self.wait(3)

        # Clear scene for next part
        self.play(FadeOut(theory_text), FadeOut(step1), FadeOut(step2), FadeOut(step3), run_time=1)
        self.wait(1)

    def demonstrate_with_example(self):
        # Example array
        example_text = Text("Let's sort the array: [64, 34, 25, 12, 22, 11, 90]", font_size=36, color=WHITE)
        self.play(Write(example_text), run_time=2)
        self.wait(2)

        # Create array visualization
        arr = [64, 34, 25, 12, 22, 11, 90]
        rectangles, labels = self.create_array_visualization(arr)

        # Position example text and array
        example_text.to_edge(UP)
        rectangles.next_to(example_text, DOWN, buff=1)

        # Animate array creation
        self.play(FadeOut(example_text), run_time=1)
        self.play(LaggedStart(*[FadeIn(rect) for rect in rectangles], lag_ratio=0.2), run_time=2)
        self.play(LaggedStart(*[Write(label) for label in labels], lag_ratio=0.2), run_time=2)
        self.wait(2)

        # Perform bubble sort
        self.bubble_sort(rectangles, labels, arr)

        # Clear scene for next part
        self.play(FadeOut(VGroup(*rectangles, *labels)), run_time=1)
        self.wait(1)

    def step_by_step_analysis(self):
        # Step-by-step analysis
        analysis_text = Text("Step-by-Step Analysis", font_size=40, color=YELLOW)
        self.play(Write(analysis_text), run_time=2)
        self.wait(1)
        self.play(FadeOut(analysis_text), run_time=1)

        # Create a smaller array for detailed analysis
        small_arr = [5, 3, 8, 4, 2]
        small_rectangles, small_labels = self.create_array_visualization(small_arr, scale=0.7)
        small_rectangles.move_to(ORIGIN)
        self.play(LaggedStart(*[FadeIn(rect) for rect in small_rectangles], lag_ratio=0.2), run_time=2)
        self.play(LaggedStart(*[Write(label) for label in small_labels], lag_ratio=0.2), run_time=2)
        self.wait(2)

        # Detailed step-by-step sorting
        self.detailed_bubble_sort(small_rectangles, small_labels, small_arr)

        # Clear scene for next part
        self.play(FadeOut(VGroup(*small_rectangles, *small_labels)), run_time=1)
        self.wait(1)

    def conclude(self):
        # Conclusion
        conclusion_text = Text("Bubble Sort Summary", font_size=40, color=YELLOW)
        time_complexity = Text("Time Complexity: O(n²) in worst and average cases", font_size=32, color=GREEN)
        space_complexity = Text("Space Complexity: O(1) - sorts in place", font_size=32, color=GREEN)
        stability = Text("Stable: Yes", font_size=32, color=GREEN)
        use_case = Text("Use Case: Educational purposes, small datasets", font_size=32, color=GREEN)

        # Position text
        conclusion_text.to_edge(UP)
        time_complexity.next_to(conclusion_text, DOWN, buff=0.5)
        space_complexity.next_to(time_complexity, DOWN, buff=0.3)
        stability.next_to(space_complexity, DOWN, buff=0.3)
        use_case.next_to(stability, DOWN, buff=0.3)

        # Animate text
        self.play(Write(conclusion_text), run_time=2)
        self.wait(1)
        self.play(Write(time_complexity), run_time=2)
        self.wait(1)
        self.play(Write(space_complexity), run_time=2)
        self.wait(1)
        self.play(Write(stability), run_time=2)
        self.wait(1)
        self.play(Write(use_case), run_time=2)
        self.wait(3)

        # Final message
        final_message = Text("Thank you for watching!", font_size=40, color=WHITE)
        self.play(FadeOut(VGroup(conclusion_text, time_complexity, space_complexity, stability, use_case)), run_time=1)
        self.play(Write(final_message), run_time=2)
        self.wait(2)

    def create_array_visualization(self, arr, scale=1.0):
        rectangles = VGroup()
        labels = VGroup()

        for i, val in enumerate(arr):
            rect = Rectangle(width=0.8*scale, height=val*0.1*scale, color=BLUE, fill_opacity=0.7)
            label = Text(str(val), font_size=int(24*scale), color=WHITE)

            rect.move_to(LEFT*3*scale + RIGHT*i*1.2*scale)
            label.move_to(rect.get_center())

            rectangles.add(rect)
            labels.add(label)

        return rectangles, labels

    def bubble_sort(self, rectangles, labels, arr):
        n = len(arr)
        # Make copies of the original positions
        original_rectangles = rectangles.copy()
        original_labels = labels.copy()

        for i in range(n):
            for j in range(0, n-i-1):
                # Highlight the elements being compared
                self.play(
                    rectangles[j].animate.set_color(RED),
                    rectangles[j+1].animate.set_color(RED),
                    run_time=0.5
                )

                if arr[j] > arr[j+1]:
                    # Swap the elements
                    arr[j], arr[j+1] = arr[j+1], arr[j]

                    # Animate the swap
                    self.animate_swap(rectangles[j], rectangles[j+1], labels[j], labels[j+1])

                    # Update the labels after swap
                    new_labels = self.update_labels(labels, arr, j, j+1)
                    labels = new_labels
                else:
                    # No swap needed, just wait a bit
                    self.wait(0.5)

                # Return to original color
                self.play(
                    rectangles[j].animate.set_color(BLUE),
                    rectangles[j+1].animate.set_color(BLUE),
                    run_time=0.5
                )

            # After each full pass, mark the last element as sorted
            rectangles[n-i-1].set_color(GREEN)
            self.wait(0.5)

        # Final sorted array
        sorted_text = Text("Sorted Array!", font_size=36, color=GREEN)
        sorted_text.to_edge(DOWN)
        self.play(Write(sorted_text), run_time=1)
        self.wait(2)

    def detailed_bubble_sort(self, rectangles, labels, arr):
        n = len(arr)

        # Create a text to show the pass number
        pass_text = Text("Pass: 0", font_size=28, color=YELLOW)
        pass_text.to_edge(UP)
        self.play(Write(pass_text), run_time=1)
        self.wait(1)

        for i in range(n):
            # Update pass number
            self.play(Transform(pass_text, Text(f"Pass: {i+1}", font_size=28, color=YELLOW).to_edge(UP)), run_time=0.5)

            for j in range(0, n-i-1):
                # Highlight the elements being compared
                self.play(
                    rectangles[j].animate.set_color(RED),
                    rectangles[j+1].animate.set_color(RED),
                    run_time=0.5
                )

                # Create comparison text
                comparison_text = Text(f"Compare {arr[j]} and {arr[j+1]}", font_size=28, color=WHITE)
                comparison_text.next_to(pass_text, DOWN, buff=0.5)
                self.play(Write(comparison_text), run_time=1)

                if arr[j] > arr[j+1]:
                    # Show swap decision
                    swap_text = Text(f"Swap {arr[j]} and {arr[j+1]}", font_size=28, color=GREEN)
                    swap_text.next_to(comparison_text, DOWN, buff=0.3)
                    self.play(Write(swap_text), run_time=1)
                    self.wait(1)

                    # Swap the elements
                    arr[j], arr[j+1] = arr[j+1], arr[j]

                    # Animate the swap
                    self.animate_swap(rectangles[j], rectangles[j+1], labels[j], labels[j+1])

                    # Update the labels after swap
                    new_labels = self.update_labels(labels, arr, j, j+1)
                    labels = new_labels

                    # Remove swap text
                    self.play(FadeOut(swap_text), run_time=0.5)
                else:
                    # Show no swap decision
                    no_swap_text = Text(f"No swap needed", font_size=28, color=YELLOW)
                    no_swap_text.next_to(comparison_text, DOWN, buff=0.3)
                    self.play(Write(no_swap_text), run_time=1)
                    self.wait(1)
                    self.play(FadeOut(no_swap_text), run_time=0.5)

                # Remove comparison text
                self.play(FadeOut(comparison_text), run_time=0.5)

                # Return to original color
                self.play(
                    rectangles[j].animate.set_color(BLUE),
                    rectangles[j+1].animate.set_color(BLUE),
                    run_time=0.5
                )

            # After each full pass, mark the last element as sorted
            rectangles[n-i-1].set_color(GREEN)
            sorted_text = Text(f"{arr[n-i-1]} is in its final position", font_size=28, color=GREEN)
            sorted_text.next_to(pass_text, DOWN, buff=0.5)
            self.play(Write(sorted_text), run_time=1)
            self.wait(1)
            self.play(FadeOut(sorted_text), run_time=0.5)

        # Final sorted array
        sorted_text = Text("The array is now sorted!", font_size=36, color=GREEN)
        sorted_text.to_edge(DOWN)
        self.play(FadeOut(pass_text), run_time=0.5)
        self.play(Write(sorted_text), run_time=1)
        self.wait(2)

    def animate_swap(self, rect1, rect2, label1, label2):
        # Get the positions
        pos1, pos2 = rect1.get_center(), rect2.get_center()

        # Animate the swap with a slight upward movement
        self.play(
            rect1.animate.move_to(pos2 + UP*0.5).set_color(GREEN),
            rect2.animate.move_to(pos1 + UP*0.5).set_color(GREEN),
            label1.animate.move_to(pos2 + UP*0.5),
            label2.animate.move_to(pos1 + UP*0.5),
            run_time=1
        )

        # Move back to the correct positions
        self.play(
            rect1.animate.move_to(pos2).set_color(BLUE),
            rect2.animate.move_to(pos1).set_color(BLUE),
            label1.animate.move_to(pos2),
            label2.animate.move_to(pos1),
            run_time=1
        )

    def update_labels(self, labels, arr, i, j):
        # Create new labels with updated values
        new_labels = VGroup()
        for idx, val in enumerate(arr):
            label = Text(str(val), font_size=24, color=WHITE)
            label.move_to(labels[idx].get_center())
            new_labels.add(label)

        # Transform the old labels to the new ones
        self.play(
            Transform(labels[i], new_labels[i]),
            Transform(labels[j], new_labels[j]),
            run_time=0.5
        )

        return new_labels
```